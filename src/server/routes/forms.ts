// Public form endpoints: contact requests and job applications.
import express from 'express';
import rateLimit from 'express-rate-limit';
import type { Transporter } from 'nodemailer';
import { escapeHtml, plainText } from '../../shared/rich.ts';
import type { Lang } from '../../shared/types.ts';
import type { Store } from '../services/store.ts';
import { SITE } from '../services/blog.ts';
import { lines, notify, quote } from '../services/notify.ts';
import { EDUCATION, GENDERS, GROUP_FIELD, GROUPS, LEVELS, SOURCES, START, WORK_MODE, choice, groupsText, profileRows, type ApplicantProfile, type GroupItem } from '../../shared/apply.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_CV = 5 * 1024 * 1024;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const langOf = (v: unknown): Lang => (v === 'en' ? 'en' : 'vi');
const limiter = (windowMs: number, limit: number) =>
  rateLimit({ windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false, message: { ok: false, error: 'rate_limited' } });

const oneOf = (list: Record<string, unknown>, v: unknown) => (typeof v === 'string' && v in list ? v : '');

/** Keeps only known fields of the structured application, trimmed to sane lengths. */
function cleanProfile(p: unknown): ApplicantProfile | null {
  if (!p || typeof p !== 'object') return null;
  const o = p as Record<string, unknown>;
  const date = clean(o.birthDate, 10);
  const profile: ApplicantProfile = {
    gender: oneOf(GENDERS, o.gender),
    birthDate: /^(19|20)\d\d-\d\d-\d\d$/.test(date) ? date : '',
    city: clean(o.city, 200),
    links: clean(o.links, 300),
    objective: clean(o.objective, 1500),
    level: oneOf(LEVELS, o.level),
    currentRole: clean(o.currentRole, 150),
    education: oneOf(EDUCATION, o.education),
    skills: (Array.isArray(o.skills) ? o.skills : []).map((x) => clean(x, 60)).filter(Boolean).slice(0, 30),
    history: [],
    salary: clean(o.salary, 80),
    start: oneOf(START, o.start),
    workMode: oneOf(WORK_MODE, o.workMode),
    hobbies: clean(o.hobbies, 500),
    source: oneOf(SOURCES, o.source),
  };
  for (const spec of Object.values(GROUPS)) {
    const field = GROUP_FIELD[spec.key];
    const raw = o[field];
    (profile[field] as GroupItem[]) = (Array.isArray(raw) ? raw : [])
      .slice(0, spec.max)
      .map((it: Record<string, unknown>) =>
        Object.fromEntries(spec.fields.map((f) => [f.key, f.choices ? oneOf(f.choices, it?.[f.key]) : clean(it?.[f.key], f.max)]))
      )
      .filter((it) => it[spec.main]);
  }
  return profile;
}

/** Portrait sent as a data URL: JPEG / PNG / WebP up to 1.5MB. */
function readPhoto(v: unknown): { buf: Buffer; ext: string } | 'bad' | null {
  if (!v) return null;
  const buf = Buffer.from(String(v).replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (!buf.length || buf.length > 1.5 * 1024 * 1024) return 'bad';
  if (buf[0] === 0xff && buf[1] === 0xd8) return { buf, ext: 'jpg' };
  if (buf.subarray(1, 4).toString() === 'PNG') return { buf, ext: 'png' };
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return { buf, ext: 'webp' };
  return 'bad';
}

export function formsRouter(store: Store, transporter: Transporter | null) {
  const r = express.Router();
  const from = () => process.env.SMTP_FROM || `"VieTure Studio Website" <${process.env.SMTP_USER}>`;
  const recipient = () => process.env.CONTACT_TO || store.getContent().content.settings.email;

  r.post('/contact', limiter(15 * 60 * 1000, 5), express.json({ limit: '20kb' }), async (req, res) => {
    const body = req.body ?? {};
    // Honeypot: real users never fill this hidden field.
    if (clean(body.website, 200)) return res.json({ ok: true });

    const entry = {
      name: clean(body.name, 120),
      email: clean(body.email, 200),
      topic: clean(body.topic, 120),
      message: clean(body.message, 5000),
      lang: langOf(body.lang),
    };
    if (!entry.name || !EMAIL_RE.test(entry.email) || entry.message.length < 10 || body.consent !== true) {
      return res.status(400).json({ ok: false, error: 'invalid' });
    }

    const record = { ...entry, consent: true, ip: req.ip, at: new Date().toISOString() };
    try {
      await store.addContact(record);
    } catch (err) {
      console.error('[contact] could not save submission:', (err as Error).message);
    }

    void notify(
      `📩 <b>Yêu cầu liên hệ mới</b>\n` +
        lines([
          ['Họ tên', entry.name],
          ['Email', entry.email],
          ['Lĩnh vực', entry.topic],
          ['Ngôn ngữ', entry.lang],
        ]) +
        quote(entry.message) +
        `\n\n<a href="${SITE}/admin#inbox">Mở hộp thư</a>`
    );

    const to = recipient();
    if (transporter && to) {
      try {
        await transporter.sendMail({
          from: from(),
          to,
          replyTo: `"${entry.name.replace(/"/g, '')}" <${entry.email}>`,
          subject: `[VieTure Studio] ${entry.topic || 'Yêu cầu dự án'} — ${entry.name}`,
          text: `Họ tên: ${entry.name}\nEmail: ${entry.email}\nLĩnh vực: ${entry.topic}\nNgôn ngữ: ${entry.lang}\nThời gian: ${record.at}\n\n${entry.message}`,
          html: `<h2>Yêu cầu dự án mới</h2>
<p><b>Họ tên:</b> ${escapeHtml(entry.name)}<br><b>Email:</b> ${escapeHtml(entry.email)}<br><b>Lĩnh vực:</b> ${escapeHtml(entry.topic)}<br><b>Thời gian:</b> ${record.at}</p>
<p style="white-space:pre-wrap">${escapeHtml(entry.message)}</p>`,
        });
      } catch (err) {
        console.error('[contact] email failed:', (err as Error).message);
        return res.status(502).json({ ok: false, error: 'mail_failed' });
      }
    } else {
      console.warn('[contact] SMTP not configured — submission saved to the admin inbox only');
    }
    res.json({ ok: true });
  });

  r.post('/apply', limiter(60 * 60 * 1000, 5), express.json({ limit: '8mb' }), async (req, res) => {
    const body = req.body ?? {};
    if (clean(body.website, 200)) return res.json({ ok: true }); // honeypot

    const content = store.getContent().content;
    const jobId = clean(body.jobId, 80) || 'general';
    const job = (content.jobs ?? []).find((j) => j.id === jobId);
    if (jobId !== 'general' && (!job || job.open === false)) return res.status(400).json({ ok: false, error: 'job_closed' });

    const entry = {
      jobId,
      jobTitle: job ? plainText(job.title?.vi || job.title?.en || jobId) : 'Ứng tuyển tự do',
      name: clean(body.name, 120),
      email: clean(body.email, 200),
      phone: clean(body.phone, 40),
      cvLink: clean(body.cvLink, 500),
      message: clean(body.message, 5000),
      lang: langOf(body.lang),
    };
    if (entry.cvLink && !/^https?:\/\//i.test(entry.cvLink)) entry.cvLink = '';

    let cv: Buffer | null = null;
    if (body.cv) {
      cv = Buffer.from(String(body.cv).replace(/^data:[^;]+;base64,/, ''), 'base64');
      if (cv.length > MAX_CV) return res.status(400).json({ ok: false, error: 'file_too_big' });
      if (cv.subarray(0, 5).toString() !== '%PDF-') return res.status(400).json({ ok: false, error: 'file_type' });
    }
    // The structured form replaces the CV; an application without it (older clients) still needs a CV.
    const profile = cleanProfile(body.profile);
    const complete = profile
      ? Boolean(profile.level && entry.phone.replace(/\D/g, '').length >= 8 && entry.message.length >= 30)
      : Boolean(cv || entry.cvLink);
    if (!entry.name || !EMAIL_RE.test(entry.email) || !complete || body.consent !== true) {
      return res.status(400).json({ ok: false, error: 'invalid' });
    }

    const photo = readPhoto(body.photo);
    if (photo === 'bad') return res.status(400).json({ ok: false, error: 'photo' });

    const record = { ...entry, ...(profile ? { profile } : {}), consent: true, ip: req.ip, at: new Date().toISOString() };
    const saved = await store.addApplication(record, cv, photo);
    void notify(
      `🧑‍💻 <b>Hồ sơ ứng tuyển mới</b>\n` +
        lines([
          ['Vị trí', entry.jobTitle],
          ['Họ tên', entry.name],
          ['Email', entry.email],
          ['SĐT', entry.phone],
          ['Kinh nghiệm', choice(LEVELS, profile?.level)],
          ['Vị trí gần nhất', profile?.currentRole],
          ['Kỹ năng', profile?.skills.join(', ')],
          ['Lương mong muốn', profile?.salary],
          ['Link CV', entry.cvLink],
          ['CV đính kèm', saved.cvFile ? 'có (PDF)' : 'không'],
        ]) +
        quote(entry.message, 800) +
        `\n\n<a href="${SITE}/admin#applications">Mở hồ sơ ứng tuyển</a>`
    );

    const to = recipient();
    if (transporter && to) {
      transporter
        .sendMail({
          from: from(),
          to,
          replyTo: `"${entry.name.replace(/"/g, '')}" <${entry.email}>`,
          subject: `[Tuyển dụng] ${entry.jobTitle} — ${entry.name}`,
          text: [
            `Vị trí: ${entry.jobTitle}\nHọ tên: ${entry.name}\nEmail: ${entry.email}\nSĐT: ${entry.phone}`,
            ...profileRows(profile ?? undefined).map(([k, v]) => `${k}: ${v}`),
            `Link CV: ${entry.cvLink || '-'}\nCV đính kèm: ${saved.cvFile ? 'có' : 'không'}`,
            groupsText(profile ?? undefined) && `\n${groupsText(profile ?? undefined)}`,
            profile?.objective && `\nMỤC TIÊU NGHỀ NGHIỆP\n${profile.objective}`,
            `\nGIỚI THIỆU\n${entry.message}`,
          ]
            .filter(Boolean)
            .join('\n'),
          attachments: cv ? [{ filename: `CV-${entry.name.replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`, content: cv }] : [],
        })
        .catch((err: Error) => console.error('[apply] email failed:', err.message));
    }
    res.json({ ok: true });
  });

  return r;
}
