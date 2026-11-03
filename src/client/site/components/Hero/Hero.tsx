import { useEffect, useRef } from 'react';
import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Arrow } from '../../ui/Icon.tsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import './Hero.css';

/** Types the terminal lines one character at a time (instant when motion is reduced). */
function useTyping(text: string) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = text;
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    el.textContent = '';
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) timer = setTimeout(tick, text[i - 1] === '\n' ? 260 : 22);
    };
    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [text, reduce]);
  return ref;
}

export function Hero() {
  const { C, L, t } = useSite();
  const typed = useTyping(L(C.terminal).join('\n'));
  const hero = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // spotlight follows the pointer; the logo/terminal/cards parallax slightly
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      if (!reduce && fine && visual.current) {
        visual.current.style.setProperty('--px', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        visual.current.style.setProperty('--py', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      }
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, [reduce]);

  return (
    <section className="hero" ref={hero}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__spot" aria-hidden="true" />
      <div className="hero__blob hero__blob--1" aria-hidden="true" />
      <div className="hero__blob hero__blob--2" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="badge">
            <span className="badge__dot" />
            <Rich text={t('hero.badge')} />
          </p>
          <h1 className="hero__brand" aria-label={C.settings.siteName}>
            <span className="flow">VieTure</span> <span className="shine">Studio</span>
            <span className="hero__underline" aria-hidden="true" />
          </h1>
          <p className="hero__slogan">
            Build Ideas. <span className="flow">Engineer the Future.</span>
          </p>
          <Rich as="p" className="lead" text={t('hero.lead')} />
          <div className="hero__cta">
            <a href="#contact" className="btn btn--lg">
              <Rich text={t('hero.cta1')} />
              <Arrow />
            </a>
            <Rich as="a" href="#services" className="btn btn--ghost btn--lg" text={t('hero.cta2')} />
          </div>
          <ul className="hero__tags">
            {C.heroTags.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true" ref={visual}>
          <div className="orbit orbit--1">
            <span />
          </div>
          <div className="orbit orbit--2">
            <span />
          </div>
          <div className="hero__logo">
            <picture>
              <source srcSet="/brand/logo-400.webp 400w, /brand/logo.webp 800w" sizes="(max-width: 640px) 80vw, 480px" type="image/webp" />
              <img src="/brand/logo.png" alt="VieTure Studio logo" width={800} height={800} fetchPriority="high" />
            </picture>
          </div>
          <div className="terminal">
            <div className="terminal__bar">
              <i />
              <i />
              <i />
              <span className="mono">vieture@studio: ~/build</span>
            </div>
            <pre className="mono">
              <code ref={typed} />
              <span className="caret">▍</span>
            </pre>
          </div>
          <div className="float float--a">
            <span className="float__icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <div>
              <Rich as="b" text={t('hero.f1t')} />
              <Rich as="small" text={t('hero.f1d')} />
            </div>
          </div>
          <div className="float float--b">
            <span className="float__icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
              </svg>
            </span>
            <div>
              <Rich as="b" text={t('hero.f2t')} />
              <Rich as="small" text={t('hero.f2d')} />
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-hint" aria-label={t('hero.scroll')}>
        <span />
      </a>
    </section>
  );
}
