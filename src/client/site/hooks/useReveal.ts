import { useEffect } from 'react';

/**
 * Fades in every `.reveal` element as it scrolls into view. Runs after each render that changes
 * `deps`; elements already on screen at that moment appear at once instead of animating again.
 */
export function useReveal(deps: unknown[]) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12 }
    );
    const first = !document.body.dataset.ready;
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!first && r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      else io.observe(el);
    });
    document.body.dataset.ready = '1';
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
