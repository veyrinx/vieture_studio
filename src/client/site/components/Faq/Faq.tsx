import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import './Faq.css';

export function Faq() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="faq">
      <div className="container faq">
        <div className="faq__head reveal">
          <p className="eyebrow">{eyebrow(t('faq.eyebrow'))}</p>
          <Rich as="h2" text={t('faq.title')} />
          <Rich as="p" text={t('faq.desc')} />
          <Rich as="a" href="#contact" className="btn btn--ghost" text={t('nav.contact')} />
        </div>
        <div className="faq__list">
          {C.faq.map((f, i) => (
            <details className="qa reveal" style={{ '--d': `${i * 50}ms` } as React.CSSProperties} open={i === 0} key={i}>
              <summary>
                {plainText(L(f.q))}
                <span className="qa__icon" aria-hidden="true" />
              </summary>
              <Rich as="p" text={L(f.a)} />
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
