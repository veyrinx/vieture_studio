import { useSite } from '../../context.tsx';
import { Chips } from '../../ui/Lists.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Tech.css';

export function Tech() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="tech">
      <div className="container">
        <SectionHead prefix="tech" eyebrow={eyebrow(t('tech.eyebrow'))} />
        <div className="techgrid">
          {C.techGroups.map((g, i) => (
            <div className="techgrid__group reveal" style={{ '--d': `${(i % 4) * 60}ms` } as React.CSSProperties} key={i}>
              <h3>{plainText(L(g.name))}</h3>
              <Chips items={g.items} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
