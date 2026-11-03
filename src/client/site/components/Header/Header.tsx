import { useEffect, useState } from 'react';
import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { extProps } from '../../ui/format.ts';
import { plainText, safeUrl } from '../../../../shared/rich.ts';
import type { Lang } from '../../../../shared/types.ts';
import './Header.css';

export function switchLang(next: Lang) {
  try {
    localStorage.setItem('lang', next);
  } catch {
    /* private mode — preference just won't persist */
  }
  const url = new URL(location.href);
  if (next === 'en') url.searchParams.set('lang', 'en');
  else url.searchParams.delete('lang');
  location.href = url.toString();
}

/**
 * Site header. On the homepage, menu anchors (#id) scroll within the page and the link for the
 * section in view is highlighted; on other pages they point back to the homepage.
 */
export function Header({ home, visible, active }: { home: boolean; visible?: Set<string>; active?: string }) {
  const { C, L, t, lang, href } = useSite();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(active ?? '');
  const [scrolled, setScrolled] = useState(!home);

  useEffect(() => {
    if (!home) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [home]);

  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

  // highlight the menu link of the section in the middle of the screen
  useEffect(() => {
    if (!home) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(`#${e.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main > section').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [home]);

  const links = C.settings.nav
    .map((item) => ({ raw: safeUrl(item.href), label: plainText(L(item.label)) }))
    .filter(({ raw }) => !home || !raw.startsWith('#') || !visible || visible.has(raw.slice(1)))
    .map(({ raw, label }) => ({ raw, label, to: raw.startsWith('#') ? (home ? raw : `${href('/')}${raw}`) : href(raw) }));

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href={home ? '#top' : href('/')} className="brand" aria-label={C.settings.siteName}>
          <img src="/brand/icon-96.png" alt="" width={40} height={40} />
          <span>
            <span className="flow">VieTure</span> <b className="shine">Studio</b>
          </span>
        </a>
        <nav className={`nav__links${open ? ' is-open' : ''}`} id="nav-links" aria-label="Main" onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
          {links.map((l) => (
            <a key={l.raw + l.label} href={l.to} className={current === l.raw || (!home && l.raw.startsWith(active ?? '\0')) ? 'is-active' : undefined} {...extProps(l.raw)}>
              {l.label}
            </a>
          ))}
          <Rich as="a" href={home ? '#contact' : `${href('/')}#contact`} className="btn btn--sm" text={t('nav.contact')} />
        </nav>
        <div className="nav__tools">
          <div className="lang" role="group" aria-label="Language">
            {(['vi', 'en'] as const).map((l) => (
              <button type="button" key={l} data-lang={l} aria-pressed={lang === l} onClick={() => lang !== l && switchLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className={`nav__toggle${open ? ' is-open' : ''}`} aria-label={t('nav.menu')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
