// Tiny, safe text markup used for every piece of editable copy.
// Everything is HTML-escaped first; then only these patterns are turned into markup:
//   [text](url)  → link (http/https, mailto, tel, /path or #anchor only)
//   [text]       → brand gradient highlight
//   **text**     → bold
//   new line     → line break

export const escapeHtml = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

export const safeUrl = (url: unknown): string => {
  const u = String(url ?? '').trim();
  return SAFE_URL.test(u) ? u : '#';
};

export function rich(text: unknown): string {
  return escapeHtml(text)
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
      // url was escaped above; decode &amp; for the check, escape again for the attribute
      const href = safeUrl(url.replace(/&amp;/g, '&'));
      const external = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
    })
    .replace(/\[([^\]\n]+)\]/g, '<span class="flow">$1</span>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\r?\n/g, '<br />');
}

/** Plain text (for <title>, meta tags, aria labels) — strips the markup characters. */
export const plainText = (text: unknown): string =>
  String(text ?? '')
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\[([^\]\n]+)\]/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
