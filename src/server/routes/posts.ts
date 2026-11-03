// Admin API for blog posts (mounted inside the admin router, after the session check).
import { randomUUID } from 'node:crypto';
import express from 'express';
import { plainText } from '../../shared/rich.ts';
import { slugify } from '../../shared/article.ts';
import type { I18n, Post } from '../../shared/types.ts';
import type { Store } from '../services/store.ts';
import { today } from '../services/blog.ts';
import type { AdminRequest } from './admin.ts';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const pair = (v: unknown, max: number): I18n => {
  const o = (v ?? {}) as Partial<I18n>;
  return { vi: str(o.vi, max), en: str(o.en, max) };
};

function cleanPost(body: Record<string, unknown>, existing?: Post): Post {
  const title = pair(body.title, 300);
  return {
    id: existing?.id ?? randomUUID(),
    slug: slugify(body.slug || title.vi || title.en) || `bai-viet-${Date.now().toString(36)}`,
    status: body.status === 'published' ? 'published' : 'draft',
    title,
    excerpt: pair(body.excerpt, 1000),
    body: pair(body.body, 200000),
    cover: str(body.cover, 500),
    category: pair(body.category, 80),
    tags: Array.isArray(body.tags) ? body.tags.map((t) => str(t, 40).trim()).filter(Boolean).slice(0, 20) : [],
    author: str(body.author, 120),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(body.date ?? '')) ? String(body.date) : today(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export function postsRouter(store: Store) {
  const r = express.Router();

  r.get('/posts', async (_req, res) => {
    res.json({ ok: true, items: await store.getPosts() });
  });

  type Result = { status: number; error: string; post?: undefined } | { post: Post; status?: undefined; error?: undefined };

  const save = (existingId: string | null) => async (req: express.Request, res: express.Response) => {
    const user = (req as AdminRequest).user;
    const result = await store.updatePosts<Result | false>((posts) => {
      const i = existingId ? posts.findIndex((p) => p.id === existingId) : -1;
      if (existingId && i === -1) return { status: 404, error: 'not_found' };
      const post = cleanPost(req.body ?? {}, posts[i]);
      if (!plainText(post.title.vi || post.title.en)) return { status: 400, error: 'Bài viết cần có tiêu đề.' };
      if (posts.some((p, j) => j !== i && p.slug === post.slug)) return { status: 409, error: `Đường dẫn "${post.slug}" đã được dùng cho bài khác.` };
      post.updatedAt = new Date().toISOString();
      post.updatedBy = user.username;
      if (i === -1) posts.push(post);
      else posts[i] = post;
      return { post };
    });
    if (result === false) return res.status(500).json({ ok: false });
    if (result.error) return res.status(result.status).json({ ok: false, error: result.error });
    res.json({ ok: true, post: result.post });
  };

  r.post('/posts', save(null));
  r.put('/posts/:id', (req, res, next) => save(req.params.id)(req, res).catch(next));

  r.delete('/posts/:id', async (req, res) => {
    const ok = await store.updatePosts((posts) => {
      const i = posts.findIndex((p) => p.id === req.params.id);
      if (i === -1) return false;
      posts.splice(i, 1);
      return true;
    });
    res.status(ok ? 200 : 404).json({ ok: !!ok });
  });

  return r;
}
