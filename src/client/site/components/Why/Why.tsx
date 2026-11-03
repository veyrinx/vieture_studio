import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Why.css';

export function Why() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="why">
      <div className="container">
        <SectionHead prefix="why" eyebrow={eyebrow(t('why.eyebrow'))} />
        <div className="why">
          {C.reasons.map((r, i) => (
            <article className="why__item reveal" style={{ '--d': `${(i % 3) * 80}ms` } as React.CSSProperties} key={i}>
              <span className="why__icon">
                <Icon name={r.icon} />
              </span>
              <div>
                <Rich as="h3" text={L(r.title)} />
                <Rich as="p" text={L(r.desc)} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
