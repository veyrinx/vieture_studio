import { useState } from 'react';
import { useSite } from '../../context.tsx';
import { slugify } from '../../../../shared/article.ts';
import { plainText } from '../../../../shared/rich.ts';
import { PostCard } from '../../components/PostCard/PostCard.tsx';
import { PageShell } from '../PageShell.tsx';
import type { PostSummary } from '../../../../shared/types.ts';
import './Blog.css';

export const BLOG_T = {
  vi: {
    blog: 'Tin tức & Blog',
    all: 'Tất cả',
    back: '← Tất cả bài viết',
    related: 'Bài viết liên quan',
    share: 'Chia sẻ',
    empty: 'Chưa có bài viết nào.',
    copy: 'Sao chép link',
    search: 'Tìm bài viết…',
    noResult: 'Không có bài viết phù hợp.',
    clear: 'Xoá bộ lọc',
    found: (n: number) => `${n} bài viết`,
    prev: '← Trang trước',
    next: 'Trang sau →',
    page: 'Trang',
    toc: 'Mục lục',
    newer: '← Bài mới hơn',
    older: 'Bài cũ hơn →',
    home: 'Trang chủ',
  },
  en: {
    blog: 'News & Blog',
    all: 'All',
    back: '← All articles',
    related: 'Related articles',
    share: 'Share',
    empty: 'No articles yet.',
    copy: 'Copy link',
    search: 'Search articles…',
    noResult: 'No matching articles.',
    clear: 'Clear filters',
    found: (n: number) => `${n} article${n === 1 ? '' : 's'}`,
    prev: '← Previous',
    next: 'Next →',
    page: 'Page',
    toc: 'Contents',
    newer: '← Newer article',
    older: 'Older article →',
    home: 'Home',
  },
};

export const PER_PAGE = 9;

/** Accent-insensitive match: "bao mat" finds "Bảo mật". */
const fold = (s: string) =>
  plainText(s)
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ');

export function BlogList({ posts, category, tag, q: initialQ, pageNo }: { posts: PostSummary[]; category: string; tag: string; q: string; pageNo: number }) {
  const { L, lang } = useSite();
  const T = BLOG_T[lang];
  const [q, setQ] = useState(initialQ);
  const cats = [...new Map(posts.filter((p) => L(p.category)).map((p) => [slugify(p.category.vi || p.category.en), L(p.category)])).entries()];

  const words = fold(q).split(' ').filter(Boolean);
  const shown = posts.filter((p) => {
    if (category && slugify(p.category.vi || p.category.en) !== category) return false;
    if (tag && !p.tags?.some((x) => slugify(x) === tag)) return false;
    if (!words.length) return true;
    const hay = fold([L(p.title), L(p.excerpt), L(p.category), ...(p.tags ?? [])].join(' '));
    return words.every((w) => hay.includes(w));
  });
  const filtered = Boolean(category || tag || words.length);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const page = words.length ? 1 : Math.min(Math.max(1, pageNo), pages);
  const visible = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const tagName = tag && posts.flatMap((p) => p.tags ?? []).find((x) => slugify(x) === tag);

  const link = (o: { cat?: string; tag?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (o.cat) params.set('cat', o.cat);
    if (o.tag) params.set('tag', o.tag);
    if (o.page && o.page > 1) params.set('page', String(o.page));
    if (lang === 'en') params.set('lang', 'en');
    const s = params.toString();
    return `/blog${s ? `?${s}` : ''}`;
  };

  // Typing filters at once; the address keeps ?q= so the result can be shared or reloaded.
  const onSearch = (value: string) => {
    setQ(value);
    const url = new URL(location.href);
    if (value.trim()) url.searchParams.set('q', value.trim());
    else url.searchParams.delete('q');
    url.searchParams.delete('page');
    history.replaceState(null, '', url);
  };

  return (
    <PageShell active="/blog">
      <section className="section blog-head">
        <div className="container">
          <p className="eyebrow">{T.blog}</p>
          <h1>{T.blog}</h1>
          <div className="blog-tools">
            {cats.length > 0 && (
              <nav className="blog-cats" aria-label="Categories">
                <a href={link({ tag })} aria-current={!category ? 'page' : undefined}>
                  {T.all}
                </a>
                {cats.map(([slug, name]) => (
                  <a href={link({ cat: slug, tag })} aria-current={category === slug ? 'page' : undefined} key={slug}>
                    {plainText(name)}
                  </a>
                ))}
              </nav>
            )}
            <form className="blog-search" role="search" action="/blog" onSubmit={(e) => e.preventDefault()}>
              {category && <input type="hidden" name="cat" value={category} />}
              {tag && <input type="hidden" name="tag" value={tag} />}
              {lang === 'en' && <input type="hidden" name="lang" value="en" />}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" name="q" value={q} placeholder={T.search} aria-label={T.search} onChange={(e) => onSearch(e.currentTarget.value)} />
            </form>
          </div>
          {filtered && (
            <p className="blog-filter">
              <span>{T.found(shown.length)}</span>
              {tagName && <span className="blog-filter__tag">#{tagName}</span>}
              <a href={link({})}>{T.clear} ✕</a>
            </p>
          )}
        </div>
      </section>
      <section className="section section--alt blog-list">
        <div className="container">
          {visible.length ? (
            <div className="posts">
              {visible.map((p, i) => (
                <PostCard p={p} key={p.slug} featured={i === 0 && page === 1 && !filtered && visible.length > 2} />
              ))}
            </div>
          ) : (
            <p className="lg">{posts.length ? T.noResult : T.empty}</p>
          )}
          {pages > 1 && !words.length && (
            <nav className="pager" aria-label={T.page}>
              {page > 1 ? <a href={link({ cat: category, tag, page: page - 1 })} rel="prev">{T.prev}</a> : <span />}
              <span className="pager__nums">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
                  n === page ? (
                    <b aria-current="page" key={n}>
                      {n}
                    </b>
                  ) : (
                    <a href={link({ cat: category, tag, page: n })} key={n}>
                      {n}
                    </a>
                  )
                )}
              </span>
              {page < pages ? <a href={link({ cat: category, tag, page: page + 1 })} rel="next">{T.next}</a> : <span />}
            </nav>
          )}
        </div>
      </section>
    </PageShell>
  );
}
