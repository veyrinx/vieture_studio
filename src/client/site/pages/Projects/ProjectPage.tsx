import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Chips } from '../../ui/Lists.tsx';
import { plainText, safeUrl } from '../../../../shared/rich.ts';
import { renderArticle } from '../../../../shared/article.ts';
import { hasCaseStudy, projectSlug } from '../../../../shared/project.ts';
import { useReveal } from '../../hooks/useReveal.ts';
import { PROJECT_T, ProjectCard } from '../../components/Projects/Projects.tsx';
import { PageShell } from '../PageShell.tsx';
import '../Blog/Blog.css';
import './ProjectPage.css';

/** /projects/<slug> — a case study. */
export function ProjectPage({ slug }: { slug: string }) {
  const { C, L, lang, href } = useSite();
  const T = PROJECT_T[lang];
  useReveal([lang]);
  const p = C.projects.find((x) => hasCaseStudy(x) && projectSlug(x) === slug);
  if (!p) return null;
  const title = L(p.title);
  const facts = [
    [T.client, plainText(L(p.client))],
    [T.year, p.year ?? ''],
    [T.industry, plainText(L(p.industry))],
    [T.services, plainText(L(p.services))],
  ].filter(([, v]) => v);
  const results = (p.results ?? []).filter((r) => r.value);
  const gallery = (p.gallery ?? []).filter((g) => g.image);
  const others = C.projects.filter((x) => x !== p && hasCaseStudy(x)).slice(0, 3);
  return (
    <PageShell active="/projects">
      <article className="section article case">
        <div className="container article__inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href={href('/')}>{T.home}</a>
            <span aria-hidden="true">/</span>
            <a href={href('/projects')}>{T.title}</a>
          </nav>
          <Rich as="h1" text={title} />
          {L(p.desc) && <Rich as="p" className="article__lead" text={L(p.desc)} />}
        </div>

        <div className="container case__facts-wrap">
          {facts.length > 0 && (
            <dl className="case__facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              {p.tags?.length > 0 && (
                <div className="case__stack">
                  <dt>{T.stack}</dt>
                  <dd>
                    <Chips items={p.tags} />
                  </dd>
                </div>
              )}
            </dl>
          )}
          {p.url && (
            <a className="btn" href={safeUrl(p.url)} target="_blank" rel="noopener">
              {T.live} ↗
            </a>
          )}
        </div>

        {p.image && (
          <div className="container article__cover">
            <img src={safeUrl(p.image)} alt={plainText(title)} />
          </div>
        )}

        {results.length > 0 && (
          <div className="container">
            <h2 className="case__h">{T.results}</h2>
            <ul className="case__results">
              {results.map((r, i) => (
                <li className="reveal" style={{ '--d': `${i * 70}ms` } as React.CSSProperties} key={i}>
                  <b className="flow">{r.value}</b>
                  <Rich text={L(r.label)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {L(p.body) && (
          <div className="container article__inner">
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderArticle(L(p.body)) }} />
          </div>
        )}

        {gallery.length > 0 && (
          <div className="container">
            <h2 className="case__h">{T.gallery}</h2>
            <div className="case__gallery">
              {gallery.map((g, i) => (
                <figure className="reveal" key={i}>
                  <a href={safeUrl(g.image)} target="_blank" rel="noopener">
                    <img src={safeUrl(g.image)} alt={plainText(L(g.caption)) || plainText(title)} loading="lazy" />
                  </a>
                  {L(g.caption) && <Rich as="figcaption" text={L(g.caption)} />}
                </figure>
              ))}
            </div>
          </div>
        )}

        <div className="container">
          <div className="case__cta reveal">
            <div>
              <h2>{T.ctaTitle}</h2>
              <p>{T.ctaText}</p>
            </div>
            <a className="btn btn--lg" href={`${href('/')}#contact`}>
              {T.cta} →
            </a>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <h2>{T.more}</h2>
            <div className="projects">
              {others.map((x, i) => (
                <ProjectCard p={x} i={i} key={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
