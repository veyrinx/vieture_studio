import { useRef } from 'react';
import { useHomeState, useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Arrow, Icon } from '../../ui/Icon.tsx';
import { Chips, Ticks } from '../../ui/Lists.tsx';
import { pad } from '../../ui/format.ts';
import { plainText } from '../../../../shared/rich.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import './Solutions.css';

export function Solutions() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  const { tab, setTab, setTopic } = useHomeState();
  const list = useRef<HTMLDivElement>(null);
  const services = C.services;
  if (!services.length) return null;
  const active = Math.min(tab, services.length - 1);
  const s = services[active];

  const select = (i: number, focus = false) => {
    const next = (i + services.length) % services.length;
    setTab(next);
    if (focus) requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`#tab-${next}`)?.focus());
  };

  return (
    <Section id="solutions">
      <div className="container">
        <SectionHead prefix="solutions" eyebrow={eyebrow(t('solutions.eyebrow'))} />
        <div className="tabs reveal">
          <div
            className="tabs__list"
            role="tablist"
            ref={list}
            onKeyDown={(e) => {
              const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
              if (step) {
                e.preventDefault();
                select(active + step, true);
              }
            }}
          >
            {services.map((x, i) => (
              <button
                type="button"
                role="tab"
                id={`tab-${i}`}
                key={x.id ?? i}
                aria-selected={i === active}
                aria-controls="solution-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)}
              >
                <span className="tabs__icon">
                  <Icon name={x.icon} />
                </span>
                {plainText(L(x.title))}
              </button>
            ))}
          </div>
          <div className="tabs__panel" role="tabpanel" id="solution-panel" tabIndex={0} aria-labelledby={`tab-${active}`}>
            <div className="tabs__content" key={active}>
              <span className="tabs__num mono">
                {pad(active + 1)} / {pad(services.length)}
              </span>
              <Rich as="h3" text={L(s.title)} />
              <Rich as="p" className="lg" text={L(s.desc)} />
              <h4>{t('solutions.deliver')}</h4>
              <Ticks items={L(s.items)} className="ticks ticks--grid" />
              <h4>{t('solutions.stack')}</h4>
              <Chips items={s.stack} />
              <a href="#contact" className="btn tabs__cta" onClick={() => setTopic(active)}>
                {t('solutions.cta')}
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
