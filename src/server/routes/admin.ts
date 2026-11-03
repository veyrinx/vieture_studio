import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { postsRouter } from './posts.ts';
import rateLimit from 'express-rate-limit';
import {
  COOKIE,
  ROLES,
  SESSION_TTL_MS,
  USERNAME_RE,
  burnTime,
  checkPasswordStrength,
  createSession,
  destroySession,
  destroyUserSessions,
  generatePassword,
  getSession,
  hashPassword,
  readCookie,
  sessionCookie,
  verifyPassword,
} from '../services/auth.ts';
import { StoreError, type Store } from '../services/store.ts';
import { notify, telegramReady } from '../services/notify.ts';
import { groupsText, profileRows } from '../../shared/apply.ts';
import type { Application, ApplicationStatus, Role, User } from '../../shared/types.ts';

export interface AdminRequest extends Request {
  sid: string;
  user: User;
}
// Handlers below the session check always receive an AdminRequest.
const A = (req: Request) => req as AdminRequest;

const MAX_UPLOAD = 4 * 1024 * 1024;
// Only raster images, identified by their magic bytes (never trust the file name).
const IMAGE_TYPES: Array<{ ext: string; test: (b: Buffer) => boolean }> = [
  { ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'webp', test: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
  { ext: 'gif', test: (b) => b.subarray(0, 6).toString() === 'GIF87a' || b.subarray(0, 6).toString() === 'GIF89a' },
];

const publicUser = (u: User) => ({ username: u.username, role: u.role, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt ?? null });

const csvCell = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export function adminRouter(store: Store) {
  const r = express.Router();
  r.use(express.json({ limit: '6mb' }));

  // Every admin response is private and never cached.
  r.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // CSRF: state-changing requests must carry a header that a cross-site form/page cannot add.
  r.use((req, res, next) => {
    if (req.method !== 'GET' && req.get('X-Requested-With') !== 'vieture-admin') {
      return res.status(403).json({ ok: false, error: 'csrf' });
    }
    next();
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { ok: false, error: 'rate_limited' },
  });

  // ---------- session ----------
  r.post('/login', loginLimiter, async (req, res) => {
    const username = String(req.body?.username ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const users = await store.getUsers();
    const user = users.find((u) => u.username === username);
    const ok = user ? await verifyPassword(password, user.password) : (await burnTime(password), false);
    if (!ok || !user) return res.status(401).json({ ok: false, error: 'invalid_credentials' });

    user.lastLoginAt = new Date().toISOString();
    await store.updateUsers((list) => {
      const u = list.find((x) => x.username === user.username);
      if (!u) return false;
      u.lastLoginAt = user.lastLoginAt;
    });
    const sid = createSession(user.username);
    res.set('Set-Cookie', sessionCookie(req, sid, SESSION_TTL_MS));
    res.json({ ok: true, user: publicUser(user) });
  });

  // Everything below needs a valid session.
  r.use(async (req, res, next) => {
    const sid = readCookie(req, COOKIE);
    const session = getSession(sid);
    if (!session) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const user = (await store.getUsers()).find((u) => u.username === session.username);
    if (!user) {
      destroySession(sid!);
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    A(req).sid = sid!;
    A(req).user = user;
    next();
  });

  const adminOnly = (req: Request, res: Response, next: NextFunction) =>
    A(req).user.role === 'admin' ? next() : res.status(403).json({ ok: false, error: 'forbidden' });

  r.post('/logout', (req, res) => {
    destroySession(A(req).sid);
    res.set('Set-Cookie', sessionCookie(req, '', 0));
    res.json({ ok: true });
  });

  r.get('/me', (req, res) => res.json({ ok: true, user: publicUser(A(req).user) }));

  r.post('/me/password', async (req, res) => {
    const { current, next: nextPw } = req.body ?? {};
    if (!(await verifyPassword(String(current ?? ''), A(req).user.password))) {
      return res.status(400).json({ ok: false, error: 'Mật khẩu hiện tại không đúng.' });
    }
    const weak = checkPasswordStrength(nextPw);
    if (weak) return res.status(400).json({ ok: false, error: weak });
    const hash = await hashPassword(String(nextPw));
    await store.updateUsers((users) => {
      const u = users.find((x) => x.username === A(req).user.username);
      if (!u) return false;
      u.password = hash;
    });
    destroyUserSessions(A(req).user.username, A(req).sid); // sign out other devices
    res.json({ ok: true });
  });

  // ---------- notifications ----------
  r.post('/notify-test', adminOnly, async (req, res) => {
    if (!telegramReady()) return res.status(400).json({ ok: false, error: 'Chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID trên server.' });
    const ok = await notify(`✅ Thông báo thử từ trang quản trị VieTure Studio (gửi bởi <b>${A(req).user.username}</b>).`);
    res.status(ok ? 200 : 502).json(ok ? { ok } : { ok, error: 'Telegram từ chối tin nhắn — kiểm tra token, chat id và đã bấm Start với bot chưa.' });
  });

  // ---------- dashboard ----------
  r.get('/stats', async (_req, res) => {
    const contacts = await store.readContacts();
    const c = store.getContent();
    res.json({
      ok: true,
      contacts: { total: contacts.length, unread: contacts.filter((x) => !x.read).length },
      applications: await store.readApplications().then((a) => ({ total: a.length, new: a.filter((x) => x.status === 'new').length })),
      recent: contacts.slice(-5).reverse(),
      content: { rev: c.rev, updatedAt: c.updatedAt, updatedBy: c.updatedBy },
      notify: { telegram: telegramReady(), email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) },
    });
  });

  // ---------- content ----------
  r.get('/content', (_req, res) => {
    const c = store.getContent();
    res.json({ ok: true, rev: c.rev, updatedAt: c.updatedAt, updatedBy: c.updatedBy, content: c.content });
  });

  r.put('/content', async (req, res) => {
    try {
      const saved = await store.saveContent(req.body?.content, { rev: req.body?.rev, user: A(req).user.username });
      res.json({ ok: true, rev: saved.rev, updatedAt: saved.updatedAt });
    } catch (err) {
      if (err instanceof StoreError && err.code === 'CONFLICT') return res.status(409).json({ ok: false, error: 'conflict' });
      if (err instanceof StoreError && err.code === 'INVALID') return res.status(400).json({ ok: false, error: err.message });
      throw err;
    }
  });

  r.get('/history', async (_req, res) => res.json({ ok: true, items: await store.listHistory() }));

  r.post('/history/:id/restore', async (req, res) => {
    try {
      const saved = await store.restoreHistory(String(req.params.id), A(req).user.username);
      res.json({ ok: true, rev: saved.rev });
    } catch (err) {
      if (err instanceof StoreError && err.code === 'NOT_FOUND') return res.status(404).json({ ok: false, error: 'not_found' });
      if (err instanceof StoreError && err.code === 'INVALID') return res.status(400).json({ ok: false, error: err.message });
      throw err;
    }
  });

  // ---------- contacts ----------
  r.get('/contacts', async (_req, res) => res.json({ ok: true, items: (await store.readContacts()).reverse() }));

  r.get('/contacts.csv', async (_req, res) => {
    const rows = (await store.readContacts()).reverse();
    const head = ['Thời gian', 'Họ tên', 'Email', 'Lĩnh vực', 'Nội dung', 'Ngôn ngữ', 'Đã đọc', 'IP'];
    const lines = rows.map((c) => [c.at, c.name, c.email, c.topic, c.message, c.lang, c.read ? 'x' : '', c.ip].map(csvCell).join(','));
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="lien-he-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + [head.map(csvCell).join(','), ...lines].join('\r\n'));
  });

  r.patch('/contacts/:id', async (req, res) => {
    const item = await store.updateContact(String(req.params.id), { read: !!req.body?.read });
    if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, item });
  });

  r.delete('/contacts/:id', async (req, res) => {
    const ok = await store.deleteContact(String(req.params.id));
    res.status(ok ? 200 : 404).json({ ok });
  });

  // ---------- blog posts ----------
  r.use(postsRouter(store));

  // ---------- job applications ----------
  const STATUS_LABEL: Record<ApplicationStatus, string> = {
    new: 'Mới',
    reviewing: 'Đang xem xét',
    interview: 'Phỏng vấn',
    passed: 'Đạt phỏng vấn',
    offer: 'Đề nghị nhận việc',
    hired: 'Đã nhận việc',
    rejected: 'Không phù hợp',
  };
  const STATUSES = Object.keys(STATUS_LABEL) as ApplicationStatus[];

  r.get('/applications', async (_req, res) => {
    const items = (await store.readApplications()).reverse().map(({ cvFile, photoFile, ...a }) => ({ ...a, hasCv: !!cvFile, hasPhoto: !!photoFile }));
    res.json({ ok: true, items });
  });

  r.get('/applications.csv', async (_req, res) => {
    const rows = (await store.readApplications()).reverse();
    const extra = ['Giới tính', 'Ngày sinh', 'Địa chỉ', 'LinkedIn / Portfolio', 'Kinh nghiệm', 'Vị trí gần nhất', 'Học vấn', 'Kỹ năng', 'Tiếng Anh', 'Lương mong muốn', 'Có thể bắt đầu', 'Hình thức', 'Biết đến qua'];
    const head = ['Thời gian', 'Vị trí', 'Họ tên', 'Email', 'SĐT', 'Trạng thái', 'Đánh giá', 'Lịch phỏng vấn', ...extra, 'Học tập, kinh nghiệm, dự án…', 'Mục tiêu', 'Sở thích', 'Link CV', 'Có file CV', 'Ghi chú', 'Giới thiệu'];
    const lines = rows.map((a) => {
      const p = new Map(profileRows(a.profile));
      return [
        a.at,
        a.jobTitle,
        a.name,
        a.email,
        a.phone,
        STATUS_LABEL[a.status] ?? a.status,
        a.rating ? '★'.repeat(a.rating) : '',
        a.interview ? `${a.interview.at.replace('T', ' ')} — ${a.interview.place}` : '',
        ...extra.map((k) => p.get(k) ?? ''),
        groupsText(a.profile),
        a.profile?.objective ?? '',
        a.profile?.hobbies ?? '',
        a.cvLink,
        a.cvFile ? 'x' : '',
        a.note,
        a.message,
      ]
        .map(csvCell)
        .join(',');
    });
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="ung-tuyen-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('\uFEFF' + [head.map(csvCell).join(','), ...lines].join('\r\n'));
  });

  r.get('/applications/:id/cv', async (req, res) => {
    const app = (await store.readApplications()).find((a) => a.id === req.params.id);
    const file = store.cvPath(app);
    if (!file) return res.status(404).json({ ok: false, error: 'not_found' });
    const safeName = `CV-${String(app!.name).replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`;
    res.set({ 'Content-Type': 'application/pdf', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" });
    res.attachment(safeName);
    res.sendFile(file, (err) => {
      if (err && !res.headersSent) res.status(404).end();
    });
  });

  r.get('/applications/:id/photo', async (req, res) => {
    const file = store.photoPath((await store.readApplications()).find((a) => a.id === req.params.id));
    if (!file) return res.status(404).end();
    res.set({ 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" });
    res.sendFile(file, (err) => {
      if (err && !res.headersSent) res.status(404).end();
    });
  });

  r.patch('/applications/:id', async (req, res) => {
    const b = req.body ?? {};
    const patch: Partial<Application> = {};
    const log: string[] = [];
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return res.status(400).json({ ok: false, error: 'Trạng thái không hợp lệ.' });
      patch.status = b.status;
      log.push(`Chuyển trạng thái: ${STATUS_LABEL[b.status as ApplicationStatus]}`);
    }
    if (b.note !== undefined) {
      patch.note = String(b.note).slice(0, 5000);
      log.push('Cập nhật ghi chú');
    }
    if (b.rating !== undefined) {
      const n = Math.round(Number(b.rating));
      if (!(n >= 0 && n <= 5)) return res.status(400).json({ ok: false, error: 'Đánh giá 0–5.' });
      patch.rating = n;
      log.push(n ? `Đánh giá ${'★'.repeat(n)}` : 'Bỏ đánh giá');
    }
    if (b.interview !== undefined) {
      if (b.interview === null) {
        patch.interview = null;
        log.push('Huỷ lịch phỏng vấn');
      } else {
        const at = String(b.interview.at ?? '');
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(at)) return res.status(400).json({ ok: false, error: 'Chọn ngày giờ phỏng vấn.' });
        const v = (x: unknown, n: number) => String(x ?? '').trim().slice(0, n);
        patch.interview = { at, place: v(b.interview.place, 300), interviewer: v(b.interview.interviewer, 120), note: v(b.interview.note, 1000) };
        log.push(`Đặt lịch phỏng vấn: ${at.replace('T', ' ')}${patch.interview.place ? ` — ${patch.interview.place}` : ''}`);
      }
    }
    // free-text entry from the admin, e.g. "Gửi email mời phỏng vấn"
    if (typeof b.logText === 'string' && b.logText.trim()) log.push(b.logText.trim().slice(0, 300));
    const by = A(req).user.username;
    const item = await store.updateApplication(String(req.params.id), patch, log.map((text) => ({ by, text })));
    if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
    const { cvFile, photoFile, ...rest } = item;
    res.json({ ok: true, item: { ...rest, hasCv: !!cvFile, hasPhoto: !!photoFile } });
  });

  r.delete('/applications/:id', async (req, res) => {
    const ok = await store.deleteApplication(String(req.params.id));
    res.status(ok ? 200 : 404).json({ ok });
  });

  // ---------- uploads ----------
  r.get('/uploads', async (_req, res) => {
    const names = await readdir(store.files.uploads);
    const items = await Promise.all(
      names.map(async (name) => {
        const s = await stat(path.join(store.files.uploads, name));
        return { url: `/uploads/${name}`, name, size: s.size, at: s.mtime };
      })
    );
    res.json({ ok: true, items: items.sort((a, b) => b.at.getTime() - a.at.getTime()) });
  });

  r.post('/uploads', async (req, res) => {
    const data = String(req.body?.data ?? '').replace(/^data:[^;]+;base64,/, '');
    const buf = Buffer.from(data, 'base64');
    if (!buf.length || buf.length > MAX_UPLOAD) return res.status(400).json({ ok: false, error: 'Ảnh tối đa 4MB.' });
    const type = IMAGE_TYPES.find((t) => t.test(buf));
    if (!type) return res.status(400).json({ ok: false, error: 'Chỉ nhận ảnh PNG, JPG, WebP hoặc GIF.' });
    const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${type.ext}`;
    await writeFile(path.join(store.files.uploads, name), buf);
    res.json({ ok: true, url: `/uploads/${name}` });
  });

  r.delete('/uploads/:name', async (req, res) => {
    if (!/^[\w-]+\.(png|jpg|webp|gif)$/.test(req.params.name)) return res.status(400).json({ ok: false });
    try {
      await unlink(path.join(store.files.uploads, req.params.name));
      res.json({ ok: true });
    } catch {
      res.status(404).json({ ok: false });
    }
  });

  // ---------- users (admins only) ----------
  r.get('/users', adminOnly, async (_req, res) => res.json({ ok: true, items: (await store.getUsers()).map(publicUser) }));

  r.post('/users', adminOnly, async (req, res) => {
    const username = String(req.body?.username ?? '').trim().toLowerCase();
    const role = req.body?.role as Role;
    if (!USERNAME_RE.test(username)) return res.status(400).json({ ok: false, error: 'Tên đăng nhập: 3–32 ký tự a-z, 0-9, . _ -' });
    if (!ROLES.includes(role)) return res.status(400).json({ ok: false, error: 'Quyền không hợp lệ.' });
    const password = generatePassword();
    const hash = await hashPassword(password);
    const created = await store.updateUsers((users) => {
      if (users.some((u) => u.username === username)) return false;
      users.push({ username, role, password: hash, createdAt: new Date().toISOString() });
    });
    if (created === false) return res.status(409).json({ ok: false, error: 'Tên đăng nhập đã tồn tại.' });
    res.json({ ok: true, user: { username, role }, password });
  });

  r.patch('/users/:username', adminOnly, async (req, res) => {
    const role = req.body?.role as Role | undefined;
    if (role !== undefined && !ROLES.includes(role)) return res.status(400).json({ ok: false, error: 'Quyền không hợp lệ.' });
    const password = req.body?.resetPassword ? generatePassword() : undefined;
    const hash = password && (await hashPassword(password));
    type Out = { status: number; error: string; user?: undefined } | { user: ReturnType<typeof publicUser>; status?: undefined; error?: undefined };
    const out = await store.updateUsers<Out>((users) => {
      const user = users.find((u) => u.username === req.params.username);
      if (!user) return { status: 404, error: 'not_found' };
      if (role !== undefined) {
        if (user.role === 'admin' && role !== 'admin' && users.filter((u) => u.role === 'admin').length === 1) {
          return { status: 400, error: 'Phải còn ít nhất một quản trị viên.' };
        }
        user.role = role;
      }
      if (hash) user.password = hash;
      return { user: publicUser(user) };
    });
    if (out.error) return res.status(out.status).json({ ok: false, error: out.error });
    if (hash) destroyUserSessions(String(req.params.username));
    res.json({ ok: true, user: out.user, password });
  });

  r.delete('/users/:username', adminOnly, async (req, res) => {
    if (req.params.username === A(req).user.username) return res.status(400).json({ ok: false, error: 'Không thể tự xoá tài khoản của mình.' });
    type Out = { status: number; error: string } | { status?: undefined; error?: undefined };
    const out = await store.updateUsers<Out>((users) => {
      const i = users.findIndex((u) => u.username === req.params.username);
      if (i === -1) return { status: 404, error: 'not_found' };
      if (users[i].role === 'admin' && users.filter((u) => u.role === 'admin').length === 1) {
        return { status: 400, error: 'Phải còn ít nhất một quản trị viên.' };
      }
      users.splice(i, 1);
      return {};
    });
    if (out.error) return res.status(out.status).json({ ok: false, error: out.error });
    destroyUserSessions(String(req.params.username));
    res.json({ ok: true });
  });

  r.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[admin]', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  });

  return r;
}
