// Blog article body format (safe — no raw HTML), shared by the server, the site and the admin preview.
//   ## Heading / ### Sub-heading
//   - bullet           1. numbered
//   > quote
//   ![caption](/uploads/x.jpg)   image on its own line
//   ```  code block  ```
//   blank line         new paragraph
// Inline: [text](url) link, **bold**, [text] brand highlight (see rich.js).
import { escapeHtml, rich, safeUrl } from './rich.ts';

const inline = (s: string): string => rich(s).replace(/<br \/>/g, ' ');

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

/** Ids for headings in reading order; repeated titles get -2, -3… so every anchor is unique. */
function headingIds() {
  const seen = new Map<string, number>();
  return (title: string) => {
    const base = slugify(title) || 'muc';
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/** The ## / ### headings of an article (for the table of contents), with the same ids as renderArticle. */
export function articleHeadings(text: unknown): Heading[] {
  const nextId = headingIds();
  const out: Heading[] = [];
  let inCode = false;
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const l = line.trim();
    if (l.startsWith('```')) inCode = !inCode;
    const m = !inCode && l.match(/^(#{2,3})\s+(.+)$/);
    if (m) out.push({ level: m[1].length as 2 | 3, text: m[2], id: nextId(m[2]) });
  }
  return out;
}

export function renderArticle(text: unknown): string {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
  const nextId = headingIds();
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((x) => `<li>${inline(x)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  const flush = () => (flushPara(), flushList());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const l = line.trim();
    if (l.startsWith('```')) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i]);
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    if (!l) {
      flush();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^(#{2,3})\s+(.+)$/))) {
      flush();
      const tag = m[1].length === 2 ? 'h2' : 'h3';
      out.push(`<${tag} id="${nextId(m[2])}">${inline(m[2])}</${tag}>`);
    } else if ((m = l.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      flush();
      const cap = m[1].trim();
      out.push(`<figure><img src="${escapeHtml(safeUrl(m[2]))}" alt="${escapeHtml(cap)}" loading="lazy" />${cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : ''}</figure>`);
    } else if ((m = l.match(/^>\s?(.*)$/))) {
      flush();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if ((m = l.match(/^[-*]\s+(.+)$/)) || (m = l.match(/^\d+[.)]\s+(.+)$/))) {
      flushPara();
      const tag: 'ul' | 'ol' = /^\d/.test(l) ? 'ol' : 'ul';
      if (list && list.tag !== tag) flushList();
      list ??= { tag, items: [] };
      list.items.push(m[1]);
    } else {
      flushList();
      para.push(l);
    }
  }
  flush();
  return out.join('\n');
}

/** "Bảo mật website 2026!" → "bao-mat-website-2026" */
export function slugify(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Minutes to read, ~200 words per minute. */
export const readingTime = (text: unknown): number => Math.max(1, Math.round(String(text ?? '').split(/\s+/).filter(Boolean).length / 200));
