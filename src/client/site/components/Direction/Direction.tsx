import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import './Direction.css';

export function Direction() {
  const { t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="direction">
      <div className="container direction reveal">
        <p className="eyebrow">{eyebrow(t('direction.eyebrow'))}</p>
        <Rich as="p" className="direction__quote" text={t('direction.quote')} />
      </div>
    </Section>
  );
}
