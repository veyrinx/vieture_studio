import { useState } from 'react';
import { useSite } from '../../context.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { JobDetail, useOpenJobs } from '../../components/Careers/Careers.tsx';
import { ApplyForm } from '../../components/Careers/ApplyForm.tsx';
import { PageShell } from '../PageShell.tsx';
import { fmtDate } from '../../ui/format.ts';
import '../../components/Careers/Careers.css';
import '../Privacy/Privacy.css';
import '../Blog/Blog.css';
import './CareersPage.css';

const LABELS = {
  vi: { back: '← Tất cả vị trí', share: 'Chia sẻ', copy: 'Sao chép link', apply: 'Ứng tuyển ngay', time: 'Điền hồ sơ trực tuyến trong khoảng 5–10 phút — không bắt buộc CV.', overview: 'Tổng quan', dept: 'Bộ phận', where: 'Địa điểm', type: 'Hình thức', salary: 'Mức lương', deadline: 'Hạn nộp' },
  en: { back: '← All positions', share: 'Share', copy: 'Copy link', apply: 'Apply now', time: 'Fill in your profile online in about 5–10 minutes — no CV required.', overview: 'Overview', dept: 'Department', where: 'Location', type: 'Type', salary: 'Salary', deadline: 'Apply by' },
};

/** /careers/<id> — one role with its apply form ("general" = open application). */
export function JobPage({ jobId, url }: { jobId: string; url: string }) {
  const { L, lang, href } = useSite();
  const T = LABELS[lang];
  const job = useOpenJobs().find((j) => j.id === jobId);
  const [copied, setCopied] = useState(false);
  const title = job ? plainText(L(job.title)) : '';
  const share = [
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`],
  ];
  return (
    <PageShell active="/careers" mainClass="section jobpage">
      <div className="container">
        <a className="legal__back" href={href('/careers')}>
          {T.back}
        </a>
        <div className="jobpage__grid">
          <article className="jobpage__detail">
            <JobDetail job={job} heading="h1" />
            {job && (
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
            )}
          </article>
          <aside className="jobpage__side">
            <div className="jobpage__card">
              {job && (
                <>
                  <h2>{T.overview}</h2>
                  <dl>
                    {(
                      [
                        [T.dept, plainText(L(job.department))],
                        [T.where, plainText(L(job.location))],
                        [T.type, plainText(L(job.type))],
                        [T.salary, plainText(L(job.salary))],
                        [T.deadline, job.deadline ? fmtDate(job.deadline, lang) : ''],
                      ] as Array<[string, string]>
                    )
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                  </dl>
                </>
              )}
              <a className="btn btn--lg btn--block" href="#apply">
                {T.apply} ↓
              </a>
              <p className="muted">{T.time}</p>
            </div>
          </aside>
        </div>
        <section className="jobpage__apply" id="apply" aria-label={title || T.apply}>
          <ApplyForm jobId={job ? job.id : 'general'} />
        </section>
      </div>
    </PageShell>
  );
}
