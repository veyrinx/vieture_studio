import { useState } from 'react';
import { api } from '../../lib/api.ts';
import { L } from '../../lib/path.ts';
import { useToast } from '../../ui/Toast.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { PageError } from '../../ui/PageError.tsx';
import { useLoad } from '../../ui/useLoad.ts';
import { PostEditor, emptyPost } from './PostEditor.tsx';
import type { Post } from '../../../../shared/types.ts';
import './Blog.css';

export type Draft = Omit<Post, 'id' | 'createdAt'> & { id: string | null; createdAt?: string };

export function BlogPosts() {
  const toast = useToast();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const { data, error, reload } = useLoad(() => api<{ items: Post[] }>('/posts'), [editing === null]);

  if (editing) return <PostEditor initial={editing} onBack={() => setEditing(null)} />;
  if (error) return <PageError message={error} />;
  if (!data) return null;
  const items = data.items;
  const today = new Date().toISOString().slice(0, 10);
  const shown = items
    .filter((p) => (!status || p.status === status) && (!q || JSON.stringify([p.title, p.category, p.tags]).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const open = (p?: Post) => setEditing(structuredClone(p ?? emptyPost()));

  return (
    <div>
      <PageHead title="Blog / Tin tức" sub={`${items.length} bài · ${items.filter((p) => p.status === 'published').length} đã đăng`}>
        <a className="btn btn--ghost btn--sm" href="/blog" target="_blank" rel="noopener">
          Xem blog ↗
        </a>
        <button type="button" className="btn btn--sm" onClick={() => open()}>
          + Viết bài mới
        </button>
      </PageHead>
      <div className="panel">
        <div className="inline-form">
          <input type="search" placeholder="Tìm theo tiêu đề, chuyên mục, thẻ…" defaultValue={q} onChange={(e) => setQ(e.currentTarget.value)} />
          <select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
            <option value="">Mọi trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Nháp</option>
          </select>
        </div>
      </div>
      {shown.length ? (
        <div className="posts-admin">
          {shown.map((p) => (
            <div className="post-row" key={p.id}>
              {p.cover ? <img src={p.cover} alt="" /> : <span className="post-row__ph">{(L(p.title) || '?').slice(0, 2)}</span>}
              <div className="post-row__main">
                <button type="button" className="post-row__title" onClick={() => open(p)}>
                  {L(p.title).replace(/[[\]*]/g, '') || '(chưa có tiêu đề)'}
                </button>
                <div className="muted post-row__meta">
                  <span className={`pill ${p.status === 'published' ? (p.date > today ? 'pill--interview' : 'pill--passed') : 'pill--rejected'}`}>
                    {p.status === 'published' ? (p.date > today ? `Hẹn đăng ${p.date}` : 'Đã đăng') : 'Nháp'}
                  </span>
                  {L(p.category) && <span>{L(p.category)}</span>}
                  <span>{p.date}</span>
                  <span>/blog/{p.slug}</span>
                  {p.updatedBy && <span>sửa bởi {p.updatedBy}</span>}
                </div>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => open(p)}>
                  Sửa
                </button>
                {p.status === 'published' && (
                  <a className="btn btn--ghost btn--sm" href={`/blog/${p.slug}`} target="_blank" rel="noopener">
                    Xem ↗
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn--ghost btn--sm danger"
                  onClick={async () => {
                    if (!confirm(`Xoá bài "${L(p.title)}"? Không thể khôi phục.`)) return;
                    await api(`/posts/${p.id}`, { method: 'DELETE' });
                    toast('Đã xoá bài viết.');
                    reload();
                  }}
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel">
          <p className="muted">{items.length ? 'Không có bài khớp bộ lọc.' : 'Chưa có bài viết nào. Bấm "+ Viết bài mới" để bắt đầu.'}</p>
        </div>
      )}
    </div>
  );
}
