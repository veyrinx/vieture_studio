import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { useReveal } from '../../hooks/useReveal.ts';
import { JobCard, useOpenJobs } from '../../components/Careers/Careers.tsx';
import { PageShell } from '../PageShell.tsx';
import '../../components/Careers/Careers.css';
import '../Blog/Blog.css';
import './CareersPage.css';

/** /careers — every open role, each linking to its own page. */
export function CareersPage() {
  const { t, lang, href } = useSite();
  const jobs = useOpenJobs();
  useReveal([lang]);
  return (
    <PageShell active="/careers">
      <section className="section blog-head careers-head">
        <div className="container">
          <p className="eyebrow">{plainText(t('careers.eyebrow'))}</p>
          <Rich as="h1" text={t('careers.title')} />
          <Rich as="p" className="lg" text={t('careers.desc')} />
        </div>
      </section>
      <section className="section section--alt blog-list">
        <div className="container">
          <div className="jobs">
            {jobs.map((j, i) => (
              <JobCard job={j} i={i} key={j.id} />
            ))}
            <div className="job job--general reveal">
              <div>
                <h3>{plainText(t('careers.generalTitle'))}</h3>
                <Rich as="p" text={t(jobs.length ? 'careers.generalOpen' : 'careers.empty')} />
              </div>
              <a className="btn" href={href('/careers/general')}>
                {t('careers.general')} →
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
