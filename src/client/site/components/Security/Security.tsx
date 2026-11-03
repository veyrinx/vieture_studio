import { useHomeState, useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Arrow, Icon } from '../../ui/Icon.tsx';
import { Ticks } from '../../ui/Lists.tsx';
import { pad } from '../../ui/format.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Security.css';

export function Security() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  const { setTopic } = useHomeState();
  const sec = C.security;
  const securityTopic = Math.max(0, C.services.findIndex((s) => s.id === 'security'));
  return (
    <Section id="security">
      <div className="container">
        <SectionHead prefix="sec" eyebrow={eyebrow(t('sec.eyebrow'))} />
        <div className="sec__grid">
          {sec.services.map((x, i) => (
            <article className="sec__card reveal" style={{ '--d': `${(i % 4) * 70}ms` } as React.CSSProperties} key={i}>
              <span className="sec__icon">
                <Icon name={x.icon} />
              </span>
              <Rich as="h3" text={L(x.title)} />
              <Rich as="p" text={L(x.desc)} />
            </article>
          ))}
        </div>

        <div className="sec__detail">
          <div className="sec__process reveal">
            <Rich as="h3" text={t('sec.process')} />
            <ol className="sec__steps">
              {sec.steps.map((x, i) => (
                <li key={i}>
                  <span className="mono">{pad(i + 1)}</span>
                  <div>
                    <Rich as="b" text={L(x.title)} />
                    <Rich as="p" text={L(x.desc)} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="sec__side">
            <div className="sec__panel reveal">
              <Rich as="h3" text={t('sec.principles')} />
              <Ticks items={L(sec.principles)} />
            </div>
            <div className="sec__panel reveal">
              <Rich as="h3" text={t('sec.report')} />
              <Ticks items={L(sec.report)} />
              <Rich as="p" className="sec__sevlabel" text={t('sec.severity')} />
              <ul className="sev">
                {sec.severity.map((x, i) => (
                  <li key={i} className={`sev--${String(x).toLowerCase().replace(/[^a-z]/g, '')}`}>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="sec__cta reveal">
          <a href="#contact" className="btn btn--lg" onClick={() => setTopic(securityTopic)}>
            <Rich text={t('sec.cta')} />
            <Arrow />
          </a>
          <p>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            </svg>
            <Rich text={t('sec.note')} />
          </p>
        </div>
      </div>
    </Section>
  );
}
