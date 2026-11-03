import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Ticks } from '../../ui/Lists.tsx';
import { pad } from '../../ui/format.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Engage.css';

export function Engage() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="engage">
      <div className="container">
        <SectionHead prefix="engage" eyebrow={eyebrow(t('engage.eyebrow'))} />
        <div className="plans">
          {C.engagement.map((e, i) => (
            <article className={`plan reveal${e.featured ? ' plan--featured' : ''}`} style={{ '--d': `${i * 90}ms` } as React.CSSProperties} key={i}>
              <span className="plan__num mono">{pad(i + 1)}</span>
              <Rich as="h3" text={L(e.name)} />
              <Rich as="p" text={L(e.desc)} />
              <p className="plan__best">
                <b>{t('engage.best')}:</b> <Rich text={L(e.best)} />
              </p>
              <Ticks items={L(e.points)} />
              <a href="#contact" className={`btn ${e.featured ? '' : 'btn--ghost'} btn--block`}>
                {t('engage.cta')}
              </a>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
