import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { useReveal } from '../../hooks/useReveal.ts';
import { PROJECT_T, ProjectCard } from '../../components/Projects/Projects.tsx';
import { PageShell } from '../PageShell.tsx';
import '../Blog/Blog.css';
import '../Careers/CareersPage.css';

/** /projects — every project; those with a case study link to their own page. */
export function ProjectsPage() {
  const { C, t, lang } = useSite();
  useReveal([lang]);
  return (
    <PageShell active="/projects">
      <section className="section blog-head careers-head">
        <div className="container">
          <p className="eyebrow">{plainText(t('projects.eyebrow')) || PROJECT_T[lang].title}</p>
          <Rich as="h1" text={t('projects.title') || PROJECT_T[lang].title} />
          <Rich as="p" className="lg" text={t('projects.desc')} />
        </div>
      </section>
      <section className="section section--alt blog-list">
        <div className="container">
          <div className="projects">
            {C.projects.map((p, i) => (
              <ProjectCard p={p} i={i} key={i} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
