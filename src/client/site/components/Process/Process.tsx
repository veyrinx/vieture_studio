import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { pad } from '../../ui/format.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Process.css';

export function Process() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="process">
      <div className="container">
        <SectionHead prefix="process" eyebrow={eyebrow(t('process.eyebrow'))} />
        <ol className="steps">
          {C.steps.map((s, i) => (
            <li className="step reveal" style={{ '--d': `${i * 90}ms` } as React.CSSProperties} key={i}>
              <span className="step__num mono">{pad(i + 1)}</span>
              <Rich as="h3" text={L(s.title)} />
              <Rich as="p" text={L(s.desc)} />
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
