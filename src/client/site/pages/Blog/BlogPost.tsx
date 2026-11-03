import { useEffect, useState } from 'react';
import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { fmtDate } from '../../ui/format.ts';
import { plainText, rich, safeUrl } from '../../../../shared/rich.ts';
import { articleHeadings, readingTime, renderArticle, slugify } from '../../../../shared/article.ts';
import { PostCard } from '../../components/PostCard/PostCard.tsx';
import { PageShell } from '../PageShell.tsx';
import { BLOG_T } from './BlogList.tsx';
import type { Post, PostSummary } from '../../../../shared/types.ts';
import './Blog.css';

/** Table of contents from the article's ## / ### headings; highlights the heading being read. */
function Toc({ body, title }: { body: string; title: string }) {
  const items = articleHeadings(body);
  const [active, setActive] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-15% 0px -75% 0px' }
    );
    items.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);
  if (items.length < 3) return null;
  return (
    <details className="toc" open>
      <summary>{title}</summary>
      <ol>
        {items.map((h) => (
          <li className={`toc__l${h.level}${active === h.id ? ' is-active' : ''}`} key={h.id}>
            <a href={`#${h.id}`} dangerouslySetInnerHTML={{ __html: rich(h.text) }} />
          </li>
        ))}
      </ol>
    </details>
  );
}

export function BlogPost({ post, related, url, newer, older }: { post: Post; related: PostSummary[]; url: string; newer: PostSummary | null; older: PostSummary | null }) {
  const { L, t, lang, href } = useSite();
  const T = BLOG_T[lang];
  const [copied, setCopied] = useState(false);
  const title = L(post.title);
  const body = L(post.body);
  const share = [
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`],
    ['X', `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(plainText(title))}`],
  ];
  const catSlug = slugify(post.category?.vi || post.category?.en);
  return (
    <PageShell active="/blog">
      <article className="section article">
        <div className="container article__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href={href('/')}>{T.home}</a>
            <span aria-hidden="true">/</span>
            <a href={href('/blog')}>{T.blog}</a>
            {L(post.category) && (
              <>
                <span aria-hidden="true">/</span>
                <a href={href(`/blog?cat=${catSlug}`)}>{plainText(L(post.category))}</a>
              </>
            )}
          </nav>
          <p className="post-meta">
            {L(post.category) && <span className="post-cat">{plainText(L(post.category))}</span>}
            {post.date && <time dateTime={post.date}>{fmtDate(post.date, lang)}</time>}
            <span>
              {readingTime(body)} {plainText(t('news.read'))}
            </span>
            {post.author && <span>{post.author}</span>}
          </p>
          <Rich as="h1" text={title} />
          {L(post.excerpt) && <Rich as="p" className="article__lead" text={L(post.excerpt)} />}
        </div>
        {post.cover && (
          <div className="container article__cover">
            <img src={safeUrl(post.cover)} alt={plainText(title)} />
          </div>
        )}
        <div className="container article__inner">
          <Toc body={body} title={T.toc} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderArticle(body) }} />
          {post.tags?.length > 0 && (
            <ul className="chips article__tags">
              {post.tags.map((x) => (
                <li key={x}>
                  <a href={href(`/blog?tag=${slugify(x)}`)}>#{x}</a>
                </li>
              ))}
            </ul>
          )}
          <div className="article__share">
            <b>{T.share}:</b>
            {share.map(([n, h]) => (
              <a href={h} target="_blank" rel="noopener" key={n}>
                {n}
              </a>
            ))}
            <button type="button" onClick={() => navigator.clipboard?.writeText(url).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}>
              {copied ? '✓' : T.copy}
            </button>
          </div>
          {(newer || older) && (
            <nav className="post-nav" aria-label={T.blog}>
              {newer ? (
                <a href={href(`/blog/${encodeURIComponent(newer.slug)}`)} rel="prev">
                  <small>{T.newer}</small>
                  <Rich as="b" text={L(newer.title)} />
                </a>
              ) : (
                <span />
              )}
              {older ? (
                <a className="post-nav__older" href={href(`/blog/${encodeURIComponent(older.slug)}`)} rel="next">
                  <small>{T.older}</small>
                  <Rich as="b" text={L(older.title)} />
                </a>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </article>
      {related.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <h2>{T.related}</h2>
            <div className="posts">
              {related.map((p) => (
                <PostCard p={p} key={p.slug} />
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
