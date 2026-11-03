import { useEffect, useState } from 'react';
import { useSite } from '../../context.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { telUrl, zaloUrl } from '../../ui/format.ts';
import './FloatingActions.css';

/** Reading progress bar, Zalo / call buttons and back-to-top. */
export function FloatingActions({ fab = true }: { fab?: boolean }) {
  const { C, t } = useSite();
  const S = C.settings;
  const [y, setY] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setY(window.scrollY);
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showFab = fab && S.floatingContact && (S.zalo || S.phone);
  return (
    <>
      <div className="progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
      {showFab && (
        <div className="fab" id="fab">
          {S.zalo && (
            <a className="fab__zalo" href={zaloUrl(S.zalo)} target="_blank" rel="noopener" aria-label="Zalo">
              <Icon name="zalo" />
            </a>
          )}
          {S.phone && (
            <a className="fab__phone" href={telUrl(S.phone)} aria-label={S.phone}>
              <Icon name="phone" />
            </a>
          )}
        </div>
      )}
      <a href="#top" className={`to-top${y > 600 ? ' is-visible' : ''}`} aria-label={t('totop')} onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: 'smooth' }))}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </a>
    </>
  );
}
