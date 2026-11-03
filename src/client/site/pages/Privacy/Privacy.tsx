import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { TextBlocks } from '../../ui/Lists.tsx';
import { fmtDate } from '../../ui/format.ts';
import { PageShell } from '../PageShell.tsx';
import './Privacy.css';

const LABELS = {
  vi: { updated: 'Cập nhật lần cuối', back: '← Về trang chủ' },
  en: { updated: 'Last updated', back: '← Back to home' },
};

export function Privacy() {
  const { C, lang, href } = useSite();
  const p = C.privacy?.[lang] ?? C.privacy?.vi ?? { title: '', intro: '', sections: [] };
  const updated = C.privacy?.updated;
  return (
    <PageShell mainClass="section legal">
      <article className="container legal__inner">
        <a className="legal__back" href={href('/')}>
          {LABELS[lang].back}
        </a>
        <Rich as="h1" text={p.title} />
        {updated && (
          <p className="legal__updated">
            {LABELS[lang].updated}: <time dateTime={updated}>{fmtDate(updated, lang)}</time>
          </p>
        )}
        <Rich as="p" className="lg" text={p.intro} />
        {(p.sections ?? []).map((s, i) => (
          <section key={i}>
            <Rich as="h2" text={s.title} />
            <TextBlocks text={s.body} />
          </section>
        ))}
      </article>
    </PageShell>
  );
}
