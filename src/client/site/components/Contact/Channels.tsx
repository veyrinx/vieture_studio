import { useSite } from '../../context.tsx';
import { Icon } from '../../ui/Icon.tsx';
import { extProps, telUrl, zaloUrl } from '../../ui/format.ts';
import { plainText, safeUrl } from '../../../../shared/rich.ts';

interface Channel {
  icon: string;
  label: string;
  href?: string;
}

/** Email, phone, Zalo, address and extra channels from the admin — as <li> items. */
export function useChannels(): Channel[] {
  const { C, L } = useSite();
  const S = C.settings;
  const out: Channel[] = [];
  if (S.email) out.push({ icon: 'mail', href: `mailto:${S.email}`, label: S.email });
  if (S.phone) out.push({ icon: 'phone', href: telUrl(S.phone), label: S.phone });
  if (S.zalo) out.push({ icon: 'zalo', href: zaloUrl(S.zalo), label: `Zalo ${/^https?:/.test(S.zalo) ? '' : S.zalo}`.trim() });
  if (L(S.address)) out.push({ icon: 'map-pin', label: L(S.address) });
  for (const c of S.extraContacts ?? []) {
    if (!L(c.label)) continue;
    const href = c.url ? safeUrl(c.url) : '';
    out.push({ icon: c.icon || 'link', label: plainText(L(c.label)), href: href && href !== '#' ? href : undefined });
  }
  return out;
}

export function Channels() {
  return (
    <>
      {useChannels().map((c, i) => (
        <li key={i}>
          {c.href ? (
            <a href={c.href} {...extProps(c.href)}>
              <Icon name={c.icon} />
              <span>{c.label}</span>
            </a>
          ) : (
            <span className="channel">
              <Icon name={c.icon} />
              <span>{c.label}</span>
            </span>
          )}
        </li>
      ))}
    </>
  );
}
