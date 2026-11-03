// File-based storage in DATA_DIR (a Docker volume on the VPS):
//   content.json        — everything shown on the website (edited in /admin)
//   users.json          — admin accounts
//   contacts.jsonl      — contact form submissions, one JSON object per line
//   history/*.json      — previous versions of content.json (for restore)
//   uploads/            — images uploaded from the admin panel (public)
//   posts.json          — blog posts
//   applications.jsonl  — job applications;  applications/ — their CV files (private, admin only)
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { defaultContent } from '../../shared/default-content.ts';
import type { Application, Contact, Post, SiteContent, StoredContent, User } from '../../shared/types.ts';

const HISTORY_LIMIT = 30;
const MAX_CONTENT_BYTES = 1024 * 1024;

// Content read from disk may predate the current shape, so the merge works on plain objects.
type Loose = Record<string, any>;
const clone = <T>(v: T): T => structuredClone(v);
const isObj = (v: unknown): v is Loose => v !== null && typeof v === 'object' && !Array.isArray(v);

export class StoreError extends Error {
  code: 'CONFLICT' | 'INVALID' | 'NOT_FOUND';
  constructor(code: StoreError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

// Writes go through one queue so concurrent requests never interleave on disk.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

async function writeAtomic(file: string, data: string, mode = 0o644) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, data, { mode });
  await rename(tmp, file);
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw err;
  }
}

async function readLines(file: string): Promise<Loose[]> {
  let raw = '';
  try {
    raw = await readFile(file, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as Loose;
      } catch {
        return null;
      }
    })
    .filter((x): x is Loose => x !== null);
}

const linesOf = (list: unknown[]) => list.map((x) => JSON.stringify(x)).join('\n') + (list.length ? '\n' : '');

/** Fill in anything added to the defaults after this content.json was created. */
export function withDefaults(content: unknown): SiteContent {
  const c: Loose = isObj(content) ? clone(content) : {};
  const d = defaultContent as unknown as Loose;
  // Content saved before migrations existed has run none of them (read this before defaults are copied in).
  const done: string[] = Array.isArray(c.migrations) ? c.migrations : [];
  for (const key of Object.keys(d)) if (!(key in c)) c[key] = clone(d[key]);
  if (!isObj(c.settings)) c.settings = {};
  if (!isObj(c.text)) c.text = {};
  if (!Array.isArray(c.sections)) c.sections = [];
  for (const key of Object.keys(d.settings)) if (!(key in c.settings)) c.settings[key] = clone(d.settings[key]);
  for (const key of Object.keys(d.text)) if (!(key in c.text)) c.text[key] = clone(d.text[key]);
  // One-time additions to existing sites. Each runs once, so the admin can remove the result later.
  c.migrations = [...done];
  if (!done.includes('nav-blog')) {
    if (Array.isArray(c.settings.nav) && !c.settings.nav.some((l: Loose) => String(l.href).startsWith('/blog'))) {
      const faq = c.settings.nav.findIndex((l: Loose) => l.href === '#faq');
      c.settings.nav.splice(faq === -1 ? c.settings.nav.length : faq, 0, { label: { vi: 'Blog', en: 'Blog' }, href: '/blog' });
    }
    c.migrations.push('nav-blog');
  }
  // The application form no longer requires a CV: update the old error text unless the admin changed it.
  if (!done.includes('apply-no-cv')) {
    const t = c.text['apply.invalid'];
    if (isObj(t) && String(t.vi).startsWith('Vui lòng nhập họ tên, email hợp lệ và gửi kèm CV')) c.text['apply.invalid'] = clone(d.text['apply.invalid']);
    c.migrations.push('apply-no-cv');
  }
  // A section added to the defaults goes in front of the next default section the site still has
  // (e.g. "careers" lands before "contact"), not at the very bottom.
  (d.sections as Loose[]).forEach((s, i) => {
    if (c.sections.some((x: Loose) => x.id === s.id)) return;
    const nextIds = (d.sections as Loose[]).slice(i + 1).map((x) => x.id);
    const at = c.sections.findIndex((x: Loose) => nextIds.includes(x.id));
    c.sections.splice(at === -1 ? c.sections.length : at, 0, clone(s));
  });
  return c as SiteContent;
}

/** Light structural check so a bad save can never break the public page. */
export function validateContent(c: unknown): string | null {
  if (!isObj(c)) return 'content must be an object';
  if (JSON.stringify(c).length > MAX_CONTENT_BYTES) return 'content is too large';
  if (!isObj(c.settings) || !isObj(c.text)) return 'settings/text missing';
  const arrays = ['sections', 'heroTags', 'stats', 'marquee', 'services', 'audience', 'steps', 'reasons', 'techGroups', 'engagement', 'projects', 'values', 'faq'];
  if (c.jobs !== undefined && !Array.isArray(c.jobs)) return 'jobs must be a list';
  for (const key of arrays) if (!Array.isArray(c[key])) return `${key} must be a list`;
  if (c.custom !== undefined && !Array.isArray(c.custom)) return 'custom must be a list';
  if (c.settings.extraContacts !== undefined && !Array.isArray(c.settings.extraContacts)) return 'extraContacts must be a list';
  const customIds = new Set((c.custom ?? []).map((b: Loose) => b?.id));
  for (const s of c.sections as Loose[]) {
    if (!s || typeof s.id !== 'string' || !/^[a-z][\w-]{0,40}$/i.test(s.id)) return 'invalid section id';
    if (s.custom && !customIds.has(s.id)) return `custom block "${s.id}" is missing`;
  }
  if (!Array.isArray(c.settings.nav) || !Array.isArray(c.settings.footerLinks) || !Array.isArray(c.settings.social)) {
    return 'settings links must be lists';
  }
  for (const [k, v] of Object.entries(c.text)) {
    if (!isObj(v) || typeof v.vi !== 'string' || typeof v.en !== 'string') return `text "${k}" must have vi and en`;
  }
  return null;
}

export interface HistoryItem {
  id: string;
  rev: number;
  updatedAt: string;
  updatedBy: string;
}

export type Store = ReturnType<typeof createStore>;

export function createStore(dataDir: string) {
  const files = {
    content: path.join(dataDir, 'content.json'),
    users: path.join(dataDir, 'users.json'),
    contacts: path.join(dataDir, 'contacts.jsonl'),
    history: path.join(dataDir, 'history'),
    uploads: path.join(dataDir, 'uploads'),
    applications: path.join(dataDir, 'applications.jsonl'),
    cvs: path.join(dataDir, 'applications'),
    posts: path.join(dataDir, 'posts.json'),
  };
  let contentCache!: StoredContent;

  async function init() {
    await mkdir(files.history, { recursive: true });
    await mkdir(files.uploads, { recursive: true });
    await mkdir(files.cvs, { recursive: true, mode: 0o700 });
    const stored = await readJson<StoredContent | null>(files.content, null);
    if (!stored) {
      contentCache = { rev: 1, updatedAt: new Date().toISOString(), updatedBy: 'system', content: clone(defaultContent) };
      await writeAtomic(files.content, JSON.stringify(contentCache, null, 2));
    } else {
      contentCache = { ...stored, content: withDefaults(stored.content) };
    }
  }

  // ---------- content ----------
  const getContent = () => contentCache;

  const saveContent = (content: unknown, { rev, user }: { rev: unknown; user: string }) =>
    serial(async () => {
      if (rev !== contentCache.rev) throw new StoreError('CONFLICT', 'conflict');
      const problem = validateContent(content);
      if (problem) throw new StoreError('INVALID', problem);
      // keep the version being replaced
      const stamp = contentCache.updatedAt.replace(/[:.]/g, '-');
      await writeAtomic(path.join(files.history, `${stamp}_r${contentCache.rev}.json`), JSON.stringify(contentCache));
      const old = (await readdir(files.history)).filter((f) => f.endsWith('.json')).sort();
      for (const f of old.slice(0, Math.max(0, old.length - HISTORY_LIMIT))) await unlink(path.join(files.history, f));

      contentCache = { rev: contentCache.rev + 1, updatedAt: new Date().toISOString(), updatedBy: user, content: content as SiteContent };
      await writeAtomic(files.content, JSON.stringify(contentCache, null, 2));
      return contentCache;
    });

  async function listHistory(): Promise<HistoryItem[]> {
    const names = (await readdir(files.history)).filter((f) => f.endsWith('.json')).sort().reverse();
    const out: HistoryItem[] = [];
    for (const id of names) {
      const v = await readJson<StoredContent | null>(path.join(files.history, id), null);
      if (v) out.push({ id, rev: v.rev, updatedAt: v.updatedAt, updatedBy: v.updatedBy });
    }
    return out;
  }

  async function restoreHistory(id: string, user: string) {
    if (!/^[\w-]+\.json$/.test(id)) throw new StoreError('INVALID', 'bad id');
    const v = await readJson<StoredContent | null>(path.join(files.history, id), null);
    if (!v) throw new StoreError('NOT_FOUND', 'not found');
    return saveContent(withDefaults(v.content), { rev: contentCache.rev, user: `${user} (restore r${v.rev})` });
  }

  // ---------- users ----------
  const getUsers = () => readJson<User[]>(files.users, []);
  // password hashes: readable by the app user only
  const writeUsers = (users: User[]) => writeAtomic(files.users, JSON.stringify(users, null, 2), 0o600);
  const saveUsers = (users: User[]) => serial(() => writeUsers(users));
  /** Read-modify-write in one queued step, so concurrent requests cannot drop each other's changes.
   *  `fn` edits the list in place; returning false skips the write. Resolves to fn's result. */
  const updateUsers = <R>(fn: (users: User[]) => R | Promise<R>) =>
    serial(async () => {
      const users = await getUsers();
      const result = await fn(users);
      if (result !== false) await writeUsers(users);
      return result;
    });

  // ---------- contacts ----------
  async function readContacts(): Promise<Contact[]> {
    // older lines had no id; derive a stable one
    return (await readLines(files.contacts)).map((c, i) => ({ id: c.id ?? `legacy-${i}-${Date.parse(c.at) || 0}`, read: false, ...c }) as Contact);
  }
  const writeContacts = (list: Contact[]) => writeAtomic(files.contacts, linesOf(list));

  const addContact = (record: Omit<Contact, 'id' | 'read'>) =>
    serial(async () => {
      const list = await readContacts();
      list.push({ id: randomUUID(), read: false, ...record });
      await writeContacts(list);
    });

  const updateContact = (id: string, patch: Partial<Contact>) =>
    serial(async () => {
      const list = await readContacts();
      const item = list.find((c) => c.id === id);
      if (!item) return null;
      Object.assign(item, patch);
      await writeContacts(list);
      return item;
    });

  const deleteContact = (id: string) =>
    serial(async () => {
      const list = await readContacts();
      const next = list.filter((c) => c.id !== id);
      if (next.length === list.length) return false;
      await writeContacts(next);
      return true;
    });

  // ---------- blog posts ----------
  let postsCache: Post[] | null = null;
  const getPosts = async () => (postsCache ??= await readJson<Post[]>(files.posts, []));
  /** Read-modify-write; `fn` edits the list in place and may return a result (false = no write). */
  const updatePosts = <R>(fn: (posts: Post[]) => R | Promise<R>) =>
    serial(async () => {
      const posts = structuredClone(await getPosts());
      const result = await fn(posts);
      if (result !== false) {
        await writeAtomic(files.posts, JSON.stringify(posts, null, 2));
        postsCache = posts;
      }
      return result;
    });

  // ---------- job applications (same line-per-record format as contacts) ----------
  const readApplications = async () => (await readLines(files.applications)) as Application[];
  const writeApplications = (list: Application[]) => writeAtomic(files.applications, linesOf(list), 0o600);

  /** Saves the CV and portrait (if any) under applications/<id>.pdf / <id>-photo.<ext> and appends the record. */
  const addApplication = (
    record: Omit<Application, 'id' | 'status' | 'note' | 'cvFile' | 'photoFile'>,
    cvBuffer: Buffer | null,
    photo: { buf: Buffer; ext: string } | null = null
  ) =>
    serial(async () => {
      const id = randomUUID();
      let cvFile: string | null = null;
      if (cvBuffer) {
        cvFile = `${id}.pdf`;
        await writeFile(path.join(files.cvs, cvFile), cvBuffer, { mode: 0o600 });
      }
      let photoFile: string | null = null;
      if (photo) {
        photoFile = `${id}-photo.${photo.ext}`;
        await writeFile(path.join(files.cvs, photoFile), photo.buf, { mode: 0o600 });
      }
      const list = await readApplications();
      const item: Application = { id, status: 'new', note: '', ...record, cvFile, photoFile, log: [{ at: record.at, by: record.name, text: 'Nộp hồ sơ' }] };
      list.push(item);
      await writeApplications(list);
      return item;
    });

  /** Applies the patch and records what changed (by whom) in the application's log. */
  const updateApplication = (id: string, patch: Partial<Application>, entries: Array<{ by: string; text: string }> = []) =>
    serial(async () => {
      const list = await readApplications();
      const item = list.find((a) => a.id === id);
      if (!item) return null;
      Object.assign(item, patch);
      const at = new Date().toISOString();
      if (entries.length) item.log = [...(item.log ?? []), ...entries.map((e) => ({ at, ...e }))].slice(-100);
      await writeApplications(list);
      return item;
    });

  const deleteApplication = (id: string) =>
    serial(async () => {
      const list = await readApplications();
      const item = list.find((a) => a.id === id);
      if (!item) return false;
      for (const f of [item.cvFile, item.photoFile]) if (f) await unlink(path.join(files.cvs, path.basename(f))).catch(() => {});
      await writeApplications(list.filter((a) => a !== item));
      return true;
    });

  const cvPath = (application: Application | undefined) =>
    application?.cvFile ? path.join(files.cvs, path.basename(application.cvFile)) : null;
  const photoPath = (application: Application | undefined) =>
    application?.photoFile ? path.join(files.cvs, path.basename(application.photoFile)) : null;

  return {
    files,
    init,
    getContent,
    saveContent,
    listHistory,
    restoreHistory,
    getUsers,
    saveUsers,
    updateUsers,
    readContacts,
    addContact,
    updateContact,
    deleteContact,
    getPosts,
    updatePosts,
    readApplications,
    addApplication,
    updateApplication,
    deleteApplication,
    cvPath,
    photoPath,
  };
}
