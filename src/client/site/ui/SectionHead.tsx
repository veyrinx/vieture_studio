import { useSite } from '../context.tsx';
import { Rich } from './Rich.tsx';

/** Eyebrow + title (+ optional description) used at the top of most sections. */
export function SectionHead({ prefix, eyebrow, desc = true }: { prefix: string; eyebrow: string; desc?: boolean }) {
  const { t } = useSite();
  return (
    <div className="section__head reveal">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <Rich as="h2" text={t(`${prefix}.title`)} />
      </div>
      {desc && <Rich as="p" text={t(`${prefix}.desc`)} />}
    </div>
  );
}
