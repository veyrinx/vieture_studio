import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Arrow } from '../../ui/Icon.tsx';
import { Section } from '../../ui/Section.tsx';
import './Band.css';

export function Band() {
  const { t } = useSite();
  return (
    <Section id="band" className="section--tight">
      <div className="container">
        <div className="band reveal">
          <div>
            <Rich as="h3" text={t('band.title')} />
            <Rich as="p" text={t('band.desc')} />
          </div>
          <a href="#contact" className="btn btn--lg btn--light">
            <Rich text={t('band.cta')} />
            <Arrow />
          </a>
        </div>
      </div>
    </Section>
  );
}
