import { useCallback, useEffect, useRef, useState } from 'react';
import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { TextBlocks, Ticks } from '../../ui/Lists.tsx';
import { fmtDate } from '../../ui/format.ts';
import { plainText } from '../../../../shared/rich.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import { ApplyForm } from './ApplyForm.tsx';
import type { Job } from '../../../../shared/types.ts';
import './Careers.css';

/** Jobs that are open and not past their deadline. */
export function useOpenJobs() {
  const { C } = useSite();
  const today = new Date().toISOString().slice(0, 10);
  return C.jobs.filter((j) => j.open !== false && (!j.deadline || j.deadline >= today));
}

export function JobMeta({ job }: { job: Job }) {
  const { L } = useSite();
  const items = [L(job.department), L(job.location), L(job.type)].map(plainText).filter(Boolean);
  return (
    <ul className="job__meta">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

/** Card in a job list. On the homepage a click opens the dialog; the link itself goes to the job's own page. */
export function JobCard({ job, i, onOpen }: { job: Job; i: number; onOpen?: (id: string) => void }) {
  const { L, t, lang, href } = useSite();
  return (
    <article className="job reveal" style={{ '--d': `${(i % 3) * 70}ms` } as React.CSSProperties}>
      <div className="job__top">
        <JobMeta job={job} />
        {job.deadline && (
          <span className="job__deadline">
            {t('careers.deadline')}: {fmtDate(job.deadline, lang, 'short')}
          </span>
        )}
      </div>
      <Rich as="h3" text={L(job.title)} />
      {L(job.summary) && <Rich as="p" text={L(job.summary)} />}
      {L(job.salary) && (
        <p className="job__salary">
          <Icon name="zap" />
          <span>
            {t('careers.salary')}: <b>{plainText(L(job.salary))}</b>
          </span>
        </p>
      )}
      <a
        className="btn btn--ghost job__btn"
        href={href(`/careers/${encodeURIComponent(job.id)}`)}
        data-job={job.id}
        onClick={(e) => {
          if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          onOpen(job.id);
        }}
      >
        {t('careers.details')} →
      </a>
    </article>
  );
}

/** Job description, requirements and benefits; the title is an h2 in the dialog and an h1 on the job's page. */
export function JobDetail({ job, heading = 'h2' }: { job: Job | undefined; heading?: 'h1' | 'h2' }) {
  const { L, t, lang } = useSite();
  const H = heading;
  const open = useOpenJobs();
  if (!job) {
    return (
      <>
        <p className="eyebrow">{plainText(t('careers.eyebrow'))}</p>
        <H id="job-dialog-title">{plainText(t('careers.generalTitle'))}</H>
        <Rich as="p" text={t(open.length ? 'careers.generalOpen' : 'careers.empty')} />
      </>
    );
  }
  const reqs = L(job.requirements);
  const benefits = L(job.benefits);
  return (
    <>
      <p className="eyebrow">{plainText(t('careers.eyebrow'))}</p>
      <Rich as={H} id="job-dialog-title" text={L(job.title)} />
      <JobMeta job={job} />
      <div className="job__facts">
        {L(job.salary) && (
          <span>
            {t('careers.salary')}: <b>{plainText(L(job.salary))}</b>
          </span>
        )}
        {job.deadline && (
          <span>
            {t('careers.deadline')}: <b>{fmtDate(job.deadline, lang)}</b>
          </span>
        )}
      </div>
      {L(job.description) && (
        <>
          <h4>{t('careers.description')}</h4>
          <TextBlocks text={L(job.description)} />
        </>
      )}
      {reqs.length > 0 && (
        <>
          <h4>{t('careers.requirements')}</h4>
          <Ticks items={reqs} />
        </>
      )}
      {benefits.length > 0 && (
        <>
          <h4>{t('careers.benefits')}</h4>
          <Ticks items={benefits} />
        </>
      )}
    </>
  );
}

export function Careers() {
  const { t } = useSite();
  const { eyebrow } = useSection();
  const jobs = useOpenJobs();
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<string>('general');
  const job = jobs.find((j) => j.id === current);

  const open = useCallback((id: string, push = true) => {
    setCurrent(id);
    if (!dialog.current?.open) dialog.current?.showModal();
    dialog.current?.scrollTo({ top: 0 });
    if (push) history.replaceState(null, '', `#job-${id}`);
  }, []);

  // Shared job links: /#job-<id>
  useEffect(() => {
    if (location.hash.startsWith('#job-')) open(decodeURIComponent(location.hash.slice(5)), false);
  }, [open]);

  return (
    <Section id="careers">
      <div className="container">
        <SectionHead prefix="careers" eyebrow={eyebrow(t('careers.eyebrow'))} />
        <div className="jobs" id="job-list">
          {jobs.map((j, i) => (
            <JobCard job={j} i={i} key={j.id} onOpen={open} />
          ))}
          <div className="job job--general reveal">
            <div>
              <h3>{plainText(t('careers.generalTitle'))}</h3>
              <Rich as="p" text={t(jobs.length ? 'careers.generalOpen' : 'careers.empty')} />
            </div>
            <a
              className="btn"
              href="#job-general"
              data-job="general"
              onClick={(e) => {
                e.preventDefault();
                open('general');
              }}
            >
              {t('careers.general')} →
            </a>
          </div>
        </div>
      </div>

      <dialog
        className="jobdlg"
        id="job-dialog"
        ref={dialog}
        aria-labelledby="job-dialog-title"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        onClose={() => {
          if (location.hash.startsWith('#job-')) history.replaceState(null, '', location.pathname + location.search + '#careers');
        }}
      >
        <div className="jobdlg__inner">
          <button type="button" className="jobdlg__close" data-close aria-label={t('careers.close')} onClick={() => dialog.current?.close()}>
            ✕
          </button>
          <div id="job-detail">
            <JobDetail job={job} />
          </div>
          <ApplyForm jobId={job ? job.id : 'general'} key={current} />
        </div>
      </dialog>
    </Section>
  );
}
