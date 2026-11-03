import { useHomeState, useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { plainText, safeUrl } from '../../../../shared/rich.ts';
import { Channels } from '../Contact/Channels.tsx';
import './Footer.css';

/** Full footer on the homepage; just the bottom bar on other pages. */
export function Footer({ home, visible }: { home: boolean; visible?: Set<string> }) {
  const { C, L, t, href } = useSite();
  const { setTab } = useHomeState();
  const S = C.settings;
  const local = (raw: string) => (raw.startsWith('#') && !home ? `${href('/')}${raw}` : raw.startsWith('/') ? href(raw) : raw);
  return (
    <footer className="footer">
      {home && (
        <div className="container footer__grid">
          <div className="footer__brand">
            <a href="#top" className="brand">
              <img src="/brand/icon-96.png" alt="" width={40} height={40} />
              <span>
                <span className="flow">VieTure</span> <b>Studio</b>
              </span>
            </a>
            <Rich as="p" text={t('footer.tagline')} />
          </div>
          <div>
            <Rich as="h3" text={t('footer.services')} />
            <ul>
              {C.services.map((s, i) => (
                <li key={s.id ?? i}>
                  <a href="#solutions" onClick={() => setTab(i)}>
                    {plainText(L(s.title))}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Rich as="h3" text={t('footer.company')} />
            <ul>
              {S.footerLinks
                .map((l) => ({ raw: safeUrl(l.href), label: plainText(L(l.label)) }))
                .filter(({ raw }) => !raw.startsWith('#') || !visible || visible.has(raw.slice(1)))
                .map((l, i) => (
                  <li key={i}>
                    <a href={local(l.raw)}>{l.label}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <Rich as="h3" text={t('footer.contact')} />
            <ul className="footer__contact">
              <Channels />
              <li>
                <a href="#contact">{plainText(t('footer.request') || t('nav.contact'))}</a>
              </li>
            </ul>
            <div className="social" id="footer-social">
              {S.social
                .filter((s) => s.url)
                .map((s, i) => (
                  <a key={i} href={safeUrl(s.url)} target="_blank" rel="noopener" aria-label={s.label || s.icon} title={s.label || s.icon}>
                    <Icon name={s.icon} />
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="container footer__bottom">
        <span>
          © {new Date().getFullYear()} {S.siteName}. <Rich text={t('footer.rights')} />
        </span>
        <Rich as="a" href={href('/privacy')} className="footer__legal" text={t('footer.privacy')} />
        <span className="mono">Build Ideas. Engineer the Future.</span>
      </div>
    </footer>
  );
}
