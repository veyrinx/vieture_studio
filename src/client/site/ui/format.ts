import type { Lang } from '../../../shared/types.ts';

export const pad = (n: number) => String(n).padStart(2, '0');

export function fmtDate(d: string, lang: Lang, month: 'long' | 'short' = 'long') {
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month, year: 'numeric' });
}

export const zaloUrl = (v: string) => (/^https?:\/\//.test(v) ? v : `https://zalo.me/${String(v).replace(/[^\d]/g, '')}`);
export const telUrl = (v: string) => `tel:${String(v).replace(/[^\d+]/g, '')}`;
export const isExternal = (href: string) => /^https?:/.test(href);
export const extProps = (href: string) => (isExternal(href) ? { target: '_blank', rel: 'noopener' } : {});
