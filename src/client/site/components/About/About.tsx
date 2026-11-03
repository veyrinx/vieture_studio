import { useEffect, useRef } from 'react';
import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import './About.css';

/** Counts a whole number up from 0 the first time it scrolls into view. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !/^\d+$/.test(value)) return;
    const end = Number(value);
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / 1200, 1);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => (io.disconnect(), cancelAnimationFrame(frame));
  }, [value, reduce]);
  return <b ref={ref}>{value}</b>;
}

export function About() {
  const { C, L, t } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="about">
      <div className="container about">
        <div className="reveal">
          <p className="eyebrow">{eyebrow(t('about.eyebrow'))}</p>
          <Rich as="h2" text={t('about.title')} />
          <Rich as="p" className="lg" text={t('about.p1')} />
          <Rich as="p" className="lg" text={t('about.p2')} />
        </div>
        <div className="stats">
          {C.stats.map((s, i) => (
            <div className="stat reveal" key={i}>
              <CountUp value={String(s.value ?? '')} />
              <Rich text={L(s.label)} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
