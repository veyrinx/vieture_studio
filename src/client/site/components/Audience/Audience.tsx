import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import { Ticks } from '../../ui/Lists.tsx';
import './Audience.css';

export function Audience() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="audience">
      <div className="container">
        <SectionHead prefix="audience" eyebrow={eyebrow(t('audience.eyebrow'))} />
        <div className="audience">
          {C.audience.map((a, i) => (
            <article className="aud reveal" style={{ '--d': `${i * 80}ms` } as React.CSSProperties} key={i}>
              <span className="aud__icon">
                <Icon name={a.icon} />
              </span>
              <Rich as="h3" text={L(a.title)} />
              <Rich as="p" text={L(a.desc)} />
              <Ticks items={L(a.points)} />
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
