import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Values.css';

export function Values() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="values">
      <div className="container">
        <SectionHead prefix="values" eyebrow={eyebrow(t('values.eyebrow'))} desc={false} />
        <ol className="values">
          {C.values.map((v, i) => (
            <li className="value reveal" style={{ '--d': `${i * 80}ms` } as React.CSSProperties} key={i}>
              <span className="value__icon">
                <Icon name={v.icon} />
              </span>
              <h3>{v.name}</h3>
              <Rich as="p" text={L(v.desc)} />
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
