import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { fmtDate } from '../../ui/format.ts';
import { plainText, rich, safeUrl } from '../../../../shared/rich.ts';
import type { PostSummary } from '../../../../shared/types.ts';
import './PostCard.css';

/** Blog post teaser used on the homepage, the blog list and "related articles". */
export function PostCard({ p, i = 0, reveal = false, more = true, featured = false }: { p: PostSummary; i?: number; reveal?: boolean; more?: boolean; featured?: boolean }) {
  const { L, t, lang, href } = useSite();
  const url = href(`/blog/${encodeURIComponent(p.slug)}`);
  const title = L(p.title);
  return (
    <article className={`post-card${featured ? ' post-card--featured' : ''}${reveal ? ' reveal' : ''}`} style={reveal ? ({ '--d': `${i * 80}ms` } as React.CSSProperties) : undefined}>
      <a className="post-card__media" href={url} tabIndex={-1} aria-hidden="true">
        {p.cover ? <img src={safeUrl(p.cover)} alt="" loading={featured ? 'eager' : 'lazy'} /> : <span>{plainText(title).slice(0, 2)}</span>}
      </a>
      <div className="post-card__body">
        <p className="post-meta">
          {L(p.category) && <span className="post-cat">{plainText(L(p.category))}</span>}
          {p.date && <time dateTime={p.date}>{fmtDate(p.date, lang)}</time>}
          <span>
            {p.minutes} {plainText(t('news.read'))}
          </span>
        </p>
        {featured ? (
          <h2>
            <a href={url} dangerouslySetInnerHTML={{ __html: rich(title) }} />
          </h2>
        ) : (
          <h3>
            <a href={url} dangerouslySetInnerHTML={{ __html: rich(title) }} />
          </h3>
        )}
        {L(p.excerpt) && <Rich as="p" text={L(p.excerpt)} />}
        {more && (
          <a className="card__more" href={url}>
            {lang === 'en' ? 'Read more →' : 'Đọc tiếp →'}
          </a>
        )}
      </div>
    </article>
  );
}
