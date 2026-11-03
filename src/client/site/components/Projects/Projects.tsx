import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Chips } from '../../ui/Lists.tsx';
import { plainText, safeUrl } from '../../../../shared/rich.ts';
import { hasCaseStudy, projectSlug } from '../../../../shared/project.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import type { Project } from '../../../../shared/types.ts';
import './Projects.css';

export const PROJECT_T = {
  vi: { study: 'Xem case study', all: 'Xem tất cả dự án', title: 'Dự án', back: '← Tất cả dự án', client: 'Khách hàng', year: 'Năm', industry: 'Lĩnh vực', services: 'Hạng mục', stack: 'Công nghệ', results: 'Kết quả', gallery: 'Hình ảnh', live: 'Xem sản phẩm thực tế', more: 'Dự án khác', ctaTitle: 'Bạn có dự án tương tự?', ctaText: 'Kể cho chúng tôi nghe ý tưởng của bạn — chúng tôi sẽ tư vấn giải pháp phù hợp.', cta: 'Liên hệ tư vấn', home: 'Trang chủ' },
  en: { study: 'Read case study', all: 'View all projects', title: 'Projects', back: '← All projects', client: 'Client', year: 'Year', industry: 'Industry', services: 'Services', stack: 'Technology', results: 'Results', gallery: 'Gallery', live: 'Visit the live product', more: 'More projects', ctaTitle: 'Have a similar project?', ctaText: 'Tell us about your idea — we will suggest the right solution.', cta: 'Talk to us', home: 'Home' },
};

/** Project card: links to its case study page when it has one, and to the live product. */
export function ProjectCard({ p, i }: { p: Project; i: number }) {
  const { L, t, lang, href } = useSite();
  const title = L(p.title);
  const page = hasCaseStudy(p) ? href(`/projects/${projectSlug(p)}`) : '';
  const media = p.image ? <img src={safeUrl(p.image)} alt={plainText(title)} loading="lazy" /> : <span className="project__placeholder">{plainText(title).slice(0, 2)}</span>;
  return (
    <article className="project reveal" style={{ '--d': `${(i % 3) * 80}ms` } as React.CSSProperties}>
      {page ? (
        <a className="project__media" href={page} tabIndex={-1} aria-hidden="true">
          {media}
        </a>
      ) : (
        <div className="project__media">{media}</div>
      )}
      <div className="project__body">
        {page ? (
          <h3>
            <Rich as="a" href={page} text={title} />
          </h3>
        ) : (
          <Rich as="h3" text={title} />
        )}
        <Rich as="p" text={L(p.desc)} />
        <Chips items={p.tags} />
        <div className="project__links">
          {page && (
            <a className="project__link" href={page}>
              {PROJECT_T[lang].study} →
            </a>
          )}
          {p.url && (
            <a className={page ? 'project__ext' : 'project__link'} href={safeUrl(p.url)} target="_blank" rel="noopener">
              {t('projects.view')} {page ? '↗' : '→'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const { C, t, lang, href } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="projects">
      <div className="container">
        <SectionHead prefix="projects" eyebrow={eyebrow(t('projects.eyebrow'))} />
        <div className="projects">
          {C.projects.map((p, i) => (
            <ProjectCard p={p} i={i} key={i} />
          ))}
        </div>
        {C.projects.some(hasCaseStudy) && (
          <p className="projects__all reveal">
            <a className="btn btn--ghost" href={href('/projects')}>
              {PROJECT_T[lang].all} →
            </a>
          </p>
        )}
      </div>
    </Section>
  );
}
