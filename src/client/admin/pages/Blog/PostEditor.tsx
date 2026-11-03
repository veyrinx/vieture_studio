import { useEffect, useReducer, useRef, useState } from 'react';
import { renderArticle, readingTime, slugify } from '../../../../shared/article.ts';
import { api, errMsg, uploadFile } from '../../lib/api.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { ImageField } from '../../fields/Field.tsx';
import type { I18n, Post } from '../../../../shared/types.ts';
import type { Draft } from './BlogPosts.tsx';

export const emptyPost = (): Draft => ({
  id: null,
  status: 'draft',
  slug: '',
  title: { vi: '', en: '' },
  excerpt: { vi: '', en: '' },
  body: { vi: '', en: '' },
  cover: '',
  category: { vi: '', en: '' },
  tags: [],
  author: '',
  date: new Date().toISOString().slice(0, 10),
});

const field = (label: string, input: React.ReactNode, hint?: string) => (
  <label className="f">
    <div className="f__label">{label}</div>
    {input}
    {hint && <div className="f__hint">{hint}</div>}
  </label>
);

export function PostEditor({ initial, onBack }: { initial: Draft; onBack: () => void }) {
  const { user, setLeaveGuard } = useAdmin();
  const toast = useToast();
  const post = useRef<Draft>(initial);
  const saved = useRef(JSON.stringify(initial));
  const [, change] = useReducer((x: number) => x + 1, 0);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [epoch, setEpoch] = useState(0); // re-mount inputs after a save returns the stored post
  const slugTouched = useRef(false);
  const slugInput = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLTextAreaElement>(null);
  const p = post.current;
  const dirty = JSON.stringify(p) !== saved.current;

  // leaving the editor (another page, or the browser tab) asks first when there are unsaved edits
  useEffect(() => {
    setLeaveGuard(() => JSON.stringify(post.current) !== saved.current);
    return () => setLeaveGuard(null);
  }, [setLeaveGuard]);

  const back = () => {
    if (JSON.stringify(post.current) !== saved.current && !confirm('Bài viết có thay đổi chưa lưu. Rời trang này?')) return;
    onBack();
  };

  async function persist(status: Post['status']) {
    const payload = { ...p, status };
    if (!(payload.title.vi || payload.title.en).trim()) return toast('Bài viết cần có tiêu đề.', 'err');
    try {
      const r = p.id ? await api<{ post: Post }>(`/posts/${p.id}`, { method: 'PUT', body: payload }) : await api<{ post: Post }>('/posts', { method: 'POST', body: payload });
      post.current = r.post;
      saved.current = JSON.stringify(r.post);
      setEpoch((e) => e + 1);
      toast(status === 'published' ? 'Đã đăng. Bài viết đã lên trang.' : 'Đã lưu nháp.');
    } catch (e) {
      toast(errMsg(e), 'err');
    }
  }

  // toolbar: wrap/prefix the selection in the body textarea
  const edited = () => {
    p.body[lang] = body.current!.value;
    change();
  };
  const insert = (before: string, after = '', placeholder = '') => {
    const el = body.current!;
    const { selectionStart: a, selectionEnd: b, value } = el;
    el.setRangeText(before + (value.slice(a, b) || placeholder) + after, a, b, 'end');
    el.focus();
    edited();
  };
  const linePrefix = (prefix: string) => {
    const el = body.current!;
    const start = el.value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    el.setRangeText(prefix, start, start, 'end');
    el.focus();
    edited();
  };
  const tools: Array<[string, string, () => void]> = [
    ['H2', 'Tiêu đề mục', () => linePrefix('## ')],
    ['H3', 'Tiêu đề nhỏ', () => linePrefix('### ')],
    ['B', 'In đậm', () => insert('**', '**', 'chữ đậm')],
    ['✦', 'Chữ màu thương hiệu', () => insert('[', ']', 'chữ nổi bật')],
    ['🔗', 'Chèn link', () => insert('[', '](https://)', 'chữ có link')],
    ['•', 'Gạch đầu dòng', () => linePrefix('- ')],
    ['1.', 'Danh sách số', () => linePrefix('1. ')],
    ['❝', 'Trích dẫn', () => linePrefix('> ')],
    ['</>', 'Khối code', () => insert('\n```\n', '\n```\n', 'code')],
  ];

  const i18nInput = (key: 'title' | 'excerpt' | 'category', label: string, opts: { area?: boolean; rows?: number } = {}) => (
    <div className="f">
      <div className="f__label">{label}</div>
      <div className="f__pair">
        {(['vi', 'en'] as const).map((lg) => {
          const props = {
            defaultValue: (p[key] as I18n)[lg],
            'aria-label': `${label} (${lg.toUpperCase()})`,
            placeholder: lg === 'en' ? 'Để trống = dùng bản tiếng Việt' : '',
            onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              (p[key] as I18n)[lg] = e.currentTarget.value;
              if (key === 'title' && lg === 'vi' && !slugTouched.current && !p.id) {
                p.slug = slugify(e.currentTarget.value);
                if (slugInput.current) slugInput.current.value = p.slug;
              }
              change();
            },
          };
          return (
            <div key={lg}>
              <span className="f__lang">{lg.toUpperCase()}</span>
              {opts.area ? <textarea rows={opts.rows ?? 3} {...props} /> : <input {...props} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  const words = p.body[lang].split(/\s+/).filter(Boolean).length;
  return (
    <div key={epoch}>
      <header className="phead">
        <div>
          <button type="button" className="linkbtn" onClick={back}>
            ← Tất cả bài viết
          </button>
          <h1>{p.id ? 'Sửa bài viết' : 'Bài viết mới'}</h1>
        </div>
        <div className="phead__actions">
          <span className="muted" style={dirty ? { color: '#b45309' } : undefined}>
            {dirty ? '● Chưa lưu' : p.id ? 'Đã lưu' : ''}
          </span>
          {p.id && p.status === 'published' && (
            <a className="btn btn--ghost btn--sm" href={`/blog/${p.slug}`} target="_blank" rel="noopener">
              Xem bài ↗
            </a>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => persist('draft')}>
            {p.status === 'published' ? 'Chuyển về nháp' : 'Lưu nháp'}
          </button>
          <button type="button" className="btn btn--sm" onClick={() => persist('published')}>
            {p.status === 'published' ? 'Cập nhật bài' : 'Đăng bài'}
          </button>
        </div>
      </header>
      <div className="post-grid">
        <div className="editor">
          <div className="group">
            {i18nInput('title', 'Tiêu đề')}
            {i18nInput('excerpt', 'Tóm tắt (hiện trên thẻ bài và Google)', { area: true, rows: 3 })}
          </div>
          <div className="group">
            <div className="post-body__head">
              <h3>Nội dung</h3>
              <div className="lang-tabs">
                {(['vi', 'en'] as const).map((lg) => (
                  <button type="button" key={lg} className={lg === lang ? 'is-on' : ''} onClick={() => setLang(lg)}>
                    {lg === 'vi' ? 'Tiếng Việt' : 'English'}
                  </button>
                ))}
              </div>
              <span className="muted">{`${words} từ · ~${readingTime(p.body[lang])} phút đọc`}</span>
            </div>
            <div className="post-toolbar">
              {tools.map(([text, title, fn]) => (
                <button type="button" title={title} onClick={fn} key={title}>
                  {text}
                </button>
              ))}
              <label className="post-toolbar__upload" title="Tải ảnh lên và chèn">
                🖼 Ảnh
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const f = input.files?.[0];
                    if (!f) return;
                    try {
                      const r = await uploadFile(f);
                      insert(`\n![`, `](${r.url})\n`, 'Chú thích ảnh');
                      toast('Đã chèn ảnh.');
                    } catch (err) {
                      toast(errMsg(err), 'err');
                    }
                    input.value = '';
                  }}
                />
              </label>
            </div>
            <div className="post-split">
              <textarea
                className="post-body"
                rows={22}
                key={lang}
                ref={body}
                defaultValue={p.body[lang]}
                placeholder={'Viết nội dung bài ở đây…\n\n## Tiêu đề mục\nĐoạn văn. Bỏ trống một dòng để sang đoạn mới.\n\n- Gạch đầu dòng\n> Trích dẫn'}
                onInput={edited}
              />
              <div className="post-preview">
                <div className="f__hint">Xem trước</div>
                <div className="prose admin-prose" dangerouslySetInnerHTML={{ __html: renderArticle(p.body[lang]) || '<p class="muted">Xem trước bài viết sẽ hiện ở đây.</p>' }} />
              </div>
            </div>
          </div>
        </div>
        <aside className="editor">
          <div className="group">
            <h3>Xuất bản</h3>
            {field('Ngày đăng', <input type="date" defaultValue={p.date} onInput={(e) => ((p.date = e.currentTarget.value), change())} />, 'Chọn ngày tương lai để hẹn giờ đăng.')}
            {field(
              'Đường dẫn',
              <input
                type="text"
                ref={slugInput}
                defaultValue={p.slug}
                onInput={(e) => {
                  slugTouched.current = true;
                  p.slug = slugify(e.currentTarget.value);
                  change();
                }}
                onBlur={(e) => (e.currentTarget.value = p.slug)}
              />,
              `vieturestudio.com/blog/${p.slug || '...'}`
            )}
            {field('Tác giả', <input type="text" defaultValue={p.author} placeholder={user.username} onInput={(e) => ((p.author = e.currentTarget.value), change())} />)}
          </div>
          <div className="group">
            <h3>Phân loại</h3>
            {i18nInput('category', 'Chuyên mục')}
            {field(
              'Thẻ',
              <input
                type="text"
                defaultValue={p.tags.join(', ')}
                placeholder="bảo mật, nodejs, ai"
                onInput={(e) => {
                  p.tags = e.currentTarget.value.split(',').map((x) => x.trim()).filter(Boolean);
                  change();
                }}
              />,
              'Cách nhau bằng dấu phẩy.'
            )}
          </div>
          <div className="group">
            <ImageField label="Ảnh bìa (khuyên dùng 1200×630)" value={p.cover} set={(v) => ((p.cover = v), change())} />
          </div>
        </aside>
      </div>
    </div>
  );
}
