import { useEffect, useRef } from 'react';
import { useHomeState, useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { Chips } from '../../ui/Lists.tsx';
import { pad } from '../../ui/format.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import type { Service } from '../../../../shared/types.ts';
import './Services.css';

/** Card border glows where the pointer is. */
function ServiceCard({ s, i }: { s: Service; i: number }) {
  const { L, t } = useSite();
  const { setTab } = useHomeState();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);
  return (
    <article className="card reveal" style={{ '--d': `${i * 60}ms` } as React.CSSProperties} ref={ref}>
      <div className="card__top">
        <span className="card__icon">
          <Icon name={s.icon} />
        </span>
        <span className="card__num mono">{pad(i + 1)}</span>
      </div>
      <Rich as="h3" text={L(s.title)} />
      <Rich as="p" text={L(s.desc)} />
      <Chips items={s.tags} />
      <a href="#solutions" className="card__more" onClick={() => setTab(i)}>
        {t('projects.view')} →
      </a>
    </article>
  );
}

export function Services() {
  const { C, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="services">
      <div className="container">
        <SectionHead prefix="services" eyebrow={eyebrow(t('services.eyebrow'))} />
        <div className="bento">
          {C.services.map((s, i) => (
            <ServiceCard s={s} i={i} key={s.id ?? i} />
          ))}
        </div>
      </div>
    </Section>
  );
}
