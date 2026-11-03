import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import './Mission.css';

export function Mission() {
  const { t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="mission">
      <div className="container mv">
        {(['mission', 'vision'] as const).map((k, i) => (
          <article className="mv__item reveal" key={k}>
            <p className="eyebrow">{eyebrow(t(`${k}.eyebrow`), i)}</p>
            <Rich as="h3" text={t(`${k}.title`)} />
            <Rich as="p" text={t(`${k}.desc`)} />
          </article>
        ))}
      </div>
    </Section>
  );
}
