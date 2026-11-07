// PostgreSQL storage (Neon). Data lives in these tables:
//   site_content       — everything shown on the website (edited in /admin)
//   content_history    — previous versions of site_content (for restore)
//   users              — admin accounts
//   contacts           — contact form submissions
//   posts              — blog posts
//   applications       — job applications + their CV/portrait files
//   uploads            — images uploaded from the admin panel (public)
// On first start, data/ from the old file-based store is imported automatically.
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { defaultContent } from '../../shared/default-content.ts';
import type { Application, Contact, Post, SiteContent, StoredContent, User } from '../../shared/types.ts';
import pool from './db.ts';

const HISTORY_LIMIT = 30;
const MAX_CONTENT_BYTES = 1024 * 1024;

// Content read from the database may predate the current shape, so the merge works on plain objects.
type Loose = Record<string, any>;
const clone = <T>(v: T): T => structuredClone(v);
const isObj = (v: unknown): v is Loose => v !== null && typeof v === 'object' && !Array.isArray(v);
const json = (v: unknown) => JSON.stringify(v);

export class StoreError extends Error {
  code: 'CONFLICT' | 'INVALID' | 'NOT_FOUND';
  constructor(code: StoreError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

// Writes go through one queue so concurrent requests never interleave.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS site_content (
  id smallint PRIMARY KEY CHECK (id = 1),
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS content_history (
  id bigserial PRIMARY KEY,
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  username text PRIMARY KEY,
  ord integer NOT NULL,
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY,
  seq bigserial NOT NULL,
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id text PRIMARY KEY,
  ord integer NOT NULL,
  data jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS applications (
  id text PRIMARY KEY,
  seq bigserial NOT NULL,
  data jsonb NOT NULL,
  cv_name text,
  cv_data bytea,
  photo_name text,
  photo_data bytea
);
CREATE TABLE IF NOT EXISTS uploads (
  name text PRIMARY KEY,
  mime text NOT NULL,
  size integer NOT NULL,
  at text NOT NULL,
  data bytea NOT NULL
);
`;

/** Fill in anything added to the defaults after this content was created. */
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

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
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

const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

export function createStore(dataDir: string) {
  let contentCache!: StoredContent;
  let contentCheckedAt = 0;

  async function isEmpty(table: string) {
    const { rows } = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM ${table}`);
    return rows[0].n === '0';
  }

  /** Import data/ from the previous file-based store once, when the matching table is still empty. */
  async function importLegacy() {
    const legacyDir = dataDir;
    try {
      if (await isEmpty('site_content')) {
        const stored = await readJsonFile<StoredContent | null>(path.join(legacyDir, 'content.json'), null);
        if (stored?.content) {
          await pool.query('INSERT INTO site_content (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING', [json({ ...stored, content: withDefaults(stored.content) })]);
        }
      }
      if (await isEmpty('users')) {
        const users = await readJsonFile<User[]>(path.join(legacyDir, 'users.json'), []);
        for (const [i, user] of users.entries()) {
          await pool.query('INSERT INTO users (username, ord, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (username) DO NOTHING', [user.username, i, json(user)]);
        }
      }
      if (await isEmpty('posts')) {
        const posts = await readJsonFile<Post[]>(path.join(legacyDir, 'posts.json'), []);
        for (const [i, post] of posts.entries()) {
          await pool.query('INSERT INTO posts (id, ord, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO NOTHING', [post.id, i, json(post)]);
        }
      }
      if (await isEmpty('contacts')) {
        const lines = await readLines(path.join(legacyDir, 'contacts.jsonl'));
        for (const [i, line] of lines.entries()) {
          const contact = { id: line.id ?? `legacy-${i}-${Date.parse(line.at) || 0}`, read: false, ...line } as Contact;
          await pool.query('INSERT INTO contacts (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING', [contact.id, json(contact)]);
        }
      }
      if (await isEmpty('applications')) {
        const lines = await readLines(path.join(legacyDir, 'applications.jsonl'));
        for (const line of lines) {
          const app = line as unknown as Application;
          let cv: Buffer | null = null;
          let photo: Buffer | null = null;
          try {
            if (app.cvFile) cv = await readFile(path.join(legacyDir, 'applications', path.basename(app.cvFile)));
          } catch {
            cv = null;
          }
          try {
            if (app.photoFile) photo = await readFile(path.join(legacyDir, 'applications', path.basename(app.photoFile)));
          } catch {
            photo = null;
          }
          await pool.query(
            'INSERT INTO applications (id, data, cv_name, cv_data, photo_name, photo_data) VALUES ($1, $2::jsonb, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
            [app.id, json(app), cv ? (app.cvFile ?? null) : null, cv, photo ? (app.photoFile ?? null) : null, photo]
          );
        }
      }
      if (await isEmpty('content_history')) {
        const names = await readdir(path.join(legacyDir, 'history')).catch(() => [] as string[]);
        for (const name of names.filter((f) => f.endsWith('.json')).sort()) {
          const version = await readJsonFile<StoredContent | null>(path.join(legacyDir, 'history', name), null);
          if (version) await pool.query('INSERT INTO content_history (data) VALUES ($1::jsonb)', [json(version)]);
        }
      }
      if (await isEmpty('uploads')) {
        const names = await readdir(path.join(legacyDir, 'uploads')).catch(() => [] as string[]);
        for (const name of names) {
          const ext = name.split('.').pop() ?? '';
          if (!MIME[ext]) continue;
          const data = await readFile(path.join(legacyDir, 'uploads', name)).catch(() => null);
          if (!data) continue;
          await pool.query('INSERT INTO uploads (name, mime, size, at, data) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING', [
            name,
            MIME[ext],
            data.length,
            new Date().toISOString(),
            data,
          ]);
        }
      }
    } catch (err) {
      console.warn('[store] legacy import skipped:', (err as Error).message);
    }
  }

  async function init() {
    await pool.query(SCHEMA);
    await importLegacy();
    const { rows } = await pool.query<{ data: StoredContent }>('SELECT data FROM site_content WHERE id = 1');
    if (rows[0]?.data) {
      contentCache = { ...rows[0].data, content: withDefaults(rows[0].data.content) };
    } else {
      const stored: StoredContent = { rev: 1, updatedAt: new Date().toISOString(), updatedBy: 'system', content: clone(defaultContent) };
      await pool.query('INSERT INTO site_content (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING', [json(stored)]);
      contentCache = stored;
    }
  }

  // ---------- content ----------
  const getContent = () => contentCache;

  /** Pick up content saved by another instance at most every few seconds. */
  const syncContent = async () => {
    const now = Date.now();
    if (now - contentCheckedAt < 5000) return;
    contentCheckedAt = now;
    const { rows } = await pool.query<{ data: StoredContent }>('SELECT data FROM site_content WHERE id = 1');
    const stored = rows[0]?.data;
    if (stored && stored.rev > contentCache.rev) contentCache = { ...stored, content: withDefaults(stored.content) };
  };

  const saveContent = (content: unknown, { rev, user }: { rev: unknown; user: string }) =>
    serial(async () => {
      const problem = validateContent(content);
      if (problem) throw new StoreError('INVALID', problem);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query<{ data: StoredContent }>('SELECT data FROM site_content WHERE id = 1 FOR UPDATE');
        const current = rows[0]?.data;
        if (!current) throw new StoreError('INVALID', 'content missing');
        if (rev !== current.rev) throw new StoreError('CONFLICT', 'conflict');
        const next: StoredContent = { rev: current.rev + 1, updatedAt: new Date().toISOString(), updatedBy: user, content: content as SiteContent };
        await client.query('INSERT INTO content_history (data) VALUES ($1::jsonb)', [json(current)]);
        await client.query('DELETE FROM content_history WHERE id NOT IN (SELECT id FROM content_history ORDER BY id DESC LIMIT $1)', [HISTORY_LIMIT]);
        await client.query('UPDATE site_content SET data = $1::jsonb WHERE id = 1', [json(next)]);
        await client.query('COMMIT');
        contentCache = next;
        return next;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    });

  async function listHistory(): Promise<HistoryItem[]> {
    const { rows } = await pool.query<{ id: string; data: StoredContent }>('SELECT id, data FROM content_history ORDER BY id DESC');
    return rows.map((r) => ({ id: String(r.id), rev: r.data.rev, updatedAt: r.data.updatedAt, updatedBy: r.data.updatedBy }));
  }

  async function restoreHistory(id: string, user: string) {
    if (!/^\d+$/.test(id)) throw new StoreError('INVALID', 'bad id');
    const { rows } = await pool.query<{ data: StoredContent }>('SELECT data FROM content_history WHERE id = $1', [id]);
    const version = rows[0]?.data;
    if (!version) throw new StoreError('NOT_FOUND', 'not found');
    const current = await pool.query<{ data: StoredContent }>('SELECT data FROM site_content WHERE id = 1');
    return saveContent(withDefaults(version.content), { rev: current.rows[0]?.data.rev, user: `${user} (restore r${version.rev})` });
  }

  // ---------- users ----------
  const getUsers = async (): Promise<User[]> => {
    const { rows } = await pool.query<{ data: User }>('SELECT data FROM users ORDER BY ord');
    return rows.map((r) => r.data);
  };

  async function replaceUsers(users: User[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM users');
      for (const [i, user] of users.entries()) {
        await client.query('INSERT INTO users (username, ord, data) VALUES ($1, $2, $3::jsonb)', [user.username, i, json(user)]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  const saveUsers = (users: User[]) => serial(() => replaceUsers(users));
  /** Read-modify-write in one queued step, so concurrent requests cannot drop each other's changes.
   *  `fn` edits the list in place; returning false skips the write. Resolves to fn's result. */
  const updateUsers = <R>(fn: (users: User[]) => R | Promise<R>) =>
    serial(async () => {
      const users = await getUsers();
      const result = await fn(users);
      if (result !== false) await replaceUsers(users);
      return result;
    });

  // ---------- contacts ----------
  async function readContacts(): Promise<Contact[]> {
    const { rows } = await pool.query<{ data: Contact }>('SELECT data FROM contacts ORDER BY seq');
    return rows.map((r) => r.data);
  }

  const addContact = (record: Omit<Contact, 'id' | 'read'>) =>
    serial(async () => {
      const item: Contact = { id: randomUUID(), read: false, ...record };
      await pool.query('INSERT INTO contacts (id, data) VALUES ($1, $2::jsonb)', [item.id, json(item)]);
    });

  const updateContact = (id: string, patch: Partial<Contact>) =>
    serial(async () => {
      const { rows } = await pool.query<{ data: Contact }>('SELECT data FROM contacts WHERE id = $1', [id]);
      if (!rows[0]) return null;
      const item = { ...rows[0].data, ...patch };
      await pool.query('UPDATE contacts SET data = $2::jsonb WHERE id = $1', [id, json(item)]);
      return item;
    });

  const deleteContact = (id: string) =>
    serial(async () => {
      const result = await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    });

  // ---------- blog posts ----------
  const getPosts = async (): Promise<Post[]> => {
    const { rows } = await pool.query<{ data: Post }>('SELECT data FROM posts ORDER BY ord');
    return rows.map((r) => r.data);
  };

  async function replacePosts(posts: Post[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM posts');
      for (const [i, post] of posts.entries()) {
        await client.query('INSERT INTO posts (id, ord, data) VALUES ($1, $2, $3::jsonb)', [post.id, i, json(post)]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  /** Read-modify-write; `fn` edits the list in place and may return a result (false = no write). */
  const updatePosts = <R>(fn: (posts: Post[]) => R | Promise<R>) =>
    serial(async () => {
      const posts = await getPosts();
      const result = await fn(posts);
      if (result !== false) await replacePosts(posts);
      return result;
    });

  // ---------- job applications ----------
  const readApplications = async (): Promise<Application[]> => {
    const { rows } = await pool.query<{ data: Application }>('SELECT data FROM applications ORDER BY seq');
    return rows.map((r) => r.data);
  };

  /** Saves the CV and portrait (if any) with the record. */
  const addApplication = (
    record: Omit<Application, 'id' | 'status' | 'note' | 'cvFile' | 'photoFile'>,
    cvBuffer: Buffer | null,
    photo: { buf: Buffer; ext: string } | null = null
  ) =>
    serial(async () => {
      const id = randomUUID();
      const cvFile = cvBuffer ? `${id}.pdf` : null;
      const photoFile = photo ? `${id}-photo.${photo.ext}` : null;
      const item: Application = { id, status: 'new', note: '', ...record, cvFile, photoFile, log: [{ at: record.at, by: record.name, text: 'Nộp hồ sơ' }] };
      await pool.query('INSERT INTO applications (id, data, cv_name, cv_data, photo_name, photo_data) VALUES ($1, $2::jsonb, $3, $4, $5, $6)', [
        id,
        json(item),
        cvFile,
        cvBuffer,
        photoFile,
        photo?.buf ?? null,
      ]);
      return item;
    });

  /** Applies the patch and records what changed (by whom) in the application's log. */
  const updateApplication = (id: string, patch: Partial<Application>, entries: Array<{ by: string; text: string }> = []) =>
    serial(async () => {
      const { rows } = await pool.query<{ data: Application }>('SELECT data FROM applications WHERE id = $1', [id]);
      if (!rows[0]) return null;
      const item = { ...rows[0].data, ...patch };
      const at = new Date().toISOString();
      if (entries.length) item.log = [...(item.log ?? []), ...entries.map((e) => ({ at, ...e }))].slice(-100);
      await pool.query('UPDATE applications SET data = $2::jsonb WHERE id = $1', [id, json(item)]);
      return item;
    });

  const deleteApplication = (id: string) =>
    serial(async () => {
      const result = await pool.query('DELETE FROM applications WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    });

  async function getApplicationFile(id: string, kind: 'cv' | 'photo'): Promise<{ name: string; data: Buffer } | null> {
    const nameColumn = kind === 'cv' ? 'cv_name' : 'photo_name';
    const dataColumn = kind === 'cv' ? 'cv_data' : 'photo_data';
    const { rows } = await pool.query<{ name: string | null; data: Buffer | null }>(`SELECT ${nameColumn} AS name, ${dataColumn} AS data FROM applications WHERE id = $1`, [id]);
    if (!rows[0]?.data) return null;
    return { name: rows[0].name ?? '', data: rows[0].data };
  }

  // ---------- uploads (stored in the database so they survive redeploys) ----------
  async function listUploads(): Promise<Array<{ name: string; size: number; at: string }>> {
    const { rows } = await pool.query<{ name: string; size: number; at: string }>('SELECT name, size, at FROM uploads ORDER BY at DESC');
    return rows;
  }

  async function addUpload(name: string, mime: string, data: Buffer) {
    await pool.query(
      'INSERT INTO uploads (name, mime, size, at, data) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, size = EXCLUDED.size, at = EXCLUDED.at, data = EXCLUDED.data',
      [name, mime, data.length, new Date().toISOString(), data]
    );
  }

  async function deleteUpload(name: string) {
    const result = await pool.query('DELETE FROM uploads WHERE name = $1', [name]);
    return (result.rowCount ?? 0) > 0;
  }

  async function getUpload(name: string): Promise<{ name: string; mime: string; data: Buffer } | null> {
    const { rows } = await pool.query<{ name: string; mime: string; data: Buffer }>('SELECT name, mime, data FROM uploads WHERE name = $1', [name]);
    return rows[0] ?? null;
  }

  return {
    init,
    syncContent,
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
    getApplicationFile,
    listUploads,
    addUpload,
    deleteUpload,
    getUpload,
  };
}
