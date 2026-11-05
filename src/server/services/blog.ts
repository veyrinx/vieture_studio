// Blog helpers used by the server: which posts are public, listing summaries, RSS, sitemap, JSON-LD.
import { escapeHtml as esc, plainText } from '../../shared/rich.ts';
import { readingTime } from '../../shared/article.ts';
import { projectSlug } from '../../shared/project.ts';
import type { I18n, Job, Lang, Post, PostSummary, Project } from '../../shared/types.ts';
import type { Store } from './store.ts';

export const SITE = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://vieturestudio.com')
).replace(/\/$/, '');
const L = (pair: I18n | undefined, lang: Lang) => pair?.[lang] || pair?.vi || pair?.en || '';
export const today = () => new Date().toISOString().slice(0, 10);

/** Published posts, newest first (scheduled posts appear on their date). */
export async function publishedPosts(store: Store): Promise<Post[]> {
  return (await store.getPosts())
    .filter((p) => p.status === 'published' && (!p.date || p.date <= today()))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

/** Compact version for listings (no body). */
export const summary = (p: Post): PostSummary => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  cover: p.cover,
  category: p.category,
  tags: p.tags,
  author: p.author,
  date: p.date,
  minutes: readingTime(p.body?.vi || p.body?.en),
});

export function rss(posts: Post[], siteName: string): string {
  const items = posts
    .slice(0, 30)
    .map(
      (p) =>
        `<item><title>${esc(plainText(L(p.title, 'vi')))}</title><link>${SITE}/blog/${esc(p.slug)}</link><guid>${SITE}/blog/${esc(p.slug)}</guid>${
          p.date ? `<pubDate>${new Date(`${p.date}T08:00:00+07:00`).toUTCString()}</pubDate>` : ''
        }<description>${esc(plainText(L(p.excerpt, 'vi')))}</description></item>`
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(siteName)} — Blog</title><link>${SITE}/blog</link><description>${esc(siteName)}</description><language>vi</language>${items}</channel></rss>`;
}

interface SitemapUrl {
  path: string;
  /** has an English version at ?lang=en */
  en: boolean;
  lastmod?: string;
  changefreq?: string;
  priority: number;
}

export function sitemap(posts: Post[], jobs: Job[], projects: Project[], contentUpdated: string): string {
  const day = (d: string | undefined) => (d ? d.slice(0, 10) : undefined);
  const newestPost = day(posts.map((p) => p.updatedAt || p.date).sort().pop());
  const urls: SitemapUrl[] = [
    { path: '/', en: true, lastmod: [day(contentUpdated), newestPost].filter(Boolean).sort().pop(), changefreq: 'weekly', priority: 1 },
    { path: '/blog', en: true, lastmod: newestPost, changefreq: 'daily', priority: 0.8 },
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, en: Boolean(p.title.en?.trim() && p.body.en?.trim()), lastmod: day(p.updatedAt || p.date), priority: 0.7 })),
    ...(projects.length ? [{ path: '/projects', en: true, lastmod: day(contentUpdated), changefreq: 'monthly', priority: 0.7 }] : []),
    ...projects.map((p) => ({ path: `/projects/${projectSlug(p)}`, en: Boolean(p.title.en?.trim() && p.desc.en?.trim()), lastmod: day(contentUpdated), priority: 0.7 })),
    { path: '/careers', en: true, lastmod: day(contentUpdated), changefreq: 'weekly', priority: 0.6 },
    ...jobs.map((j) => ({ path: `/careers/${encodeURIComponent(j.id)}`, en: Boolean(j.title.en?.trim()), lastmod: j.posted, priority: 0.6 })),
    { path: '/privacy', en: true, changefreq: 'yearly', priority: 0.3 },
  ];
  const link = (lang: string, href: string) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${esc(href)}" />`;
  const entry = (u: SitemapUrl, loc: string) =>
    [
      `<url><loc>${esc(loc)}</loc>`,
      ...(u.en ? [link('vi', `${SITE}${u.path}`), link('en', `${SITE}${u.path}?lang=en`), link('x-default', `${SITE}${u.path}`)] : []),
      u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : '',
      u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : '',
      `<priority>${u.priority.toFixed(1)}</priority></url>`,
    ].join('');
  // Each language version is listed as its own URL, both pointing at each other (hreflang).
  const lines = urls.flatMap((u) => [entry(u, `${SITE}${u.path}`), ...(u.en ? [entry({ ...u, priority: Math.max(0.1, u.priority - 0.1) }, `${SITE}${u.path}?lang=en`)] : [])]);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${lines.join('\n')}\n</urlset>\n`;
}

export const absolute = (url: string | undefined) => (url ? (/^https?:/.test(url) ? url : `${SITE}${url.startsWith('/') ? '' : '/'}${url}`) : `${SITE}/og.png`);

export function articleJsonLd(post: Post, siteName: string, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: plainText(L(post.title, lang)).slice(0, 110),
    description: plainText(L(post.excerpt, lang)),
    image: [absolute(post.cover)],
    datePublished: post.date || undefined,
    dateModified: (post.updatedAt || post.date || '').slice(0, 10) || undefined,
    author: { '@type': post.author ? 'Person' : 'Organization', name: post.author || siteName },
    publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: siteName, logo: { '@type': 'ImageObject', url: `${SITE}/brand/icon-512.png` } },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    articleSection: plainText(L(post.category, lang)) || undefined,
    keywords: post.tags?.length ? post.tags.join(', ') : undefined,
    isPartOf: { '@id': `${SITE}/blog#blog` },
    inLanguage: lang,
  };
}

/** Open roles that are not past their deadline (same rule as the site's job list). */
export const openJobs = (jobs: Job[]) => jobs.filter((j) => j.open !== false && (!j.deadline || j.deadline >= today()));

/** Google Jobs reads these from the free-text "type" field. */
function employmentType(text: string) {
  const s = text.toLowerCase();
  const out = [];
  if (/full|toàn thời gian/.test(s)) out.push('FULL_TIME');
  if (/part|bán thời gian/.test(s)) out.push('PART_TIME');
  if (/intern|thực tập/.test(s)) out.push('INTERN');
  if (/contract|freelance|hợp đồng|cộng tác/.test(s)) out.push('CONTRACTOR');
  return out.length ? out : undefined;
}

export function jobPostingJsonLd(job: Job, siteName: string, lang: Lang, fallbackDate: string) {
  const list = (items: string[]) => (items.length ? `<ul>${items.map((x) => `<li>${esc(plainText(x))}</li>`).join('')}</ul>` : '');
  const desc = L(job.description, lang).split('\n').filter((x) => x.trim()).map((x) => `<p>${esc(plainText(x.replace(/^- /, '')))}</p>`).join('');
  const reqs = job.requirements?.[lang]?.length ? job.requirements[lang] : job.requirements?.vi ?? [];
  const bens = job.benefits?.[lang]?.length ? job.benefits[lang] : job.benefits?.vi ?? [];
  const location = plainText(L(job.location, lang));
  const remote = /remote|từ xa/i.test(location);
  // "Hà Nội / Remote" is hybrid: keep the city as the office location
  const city = location.replace(/remote|từ xa/gi, '').replace(/^[\s/,|·-]+|[\s/,|·-]+$/g, '');
  const H = lang === 'en' ? { req: 'Requirements', ben: 'Benefits' } : { req: 'Yêu cầu', ben: 'Quyền lợi' };
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: plainText(L(job.title, lang)),
    description: desc + (reqs.length ? `<h3>${H.req}</h3>${list(reqs)}` : '') + (bens.length ? `<h3>${H.ben}</h3>${list(bens)}` : '') || plainText(L(job.summary, lang)),
    identifier: { '@type': 'PropertyValue', name: siteName, value: job.id },
    datePosted: job.posted || fallbackDate,
    validThrough: job.deadline ? `${job.deadline}T23:59:59+07:00` : undefined,
    employmentType: employmentType(`${job.type?.vi ?? ''} ${job.type?.en ?? ''}`),
    hiringOrganization: { '@type': 'Organization', name: siteName, sameAs: `${SITE}/`, logo: `${SITE}/brand/icon-512.png` },
    ...(remote ? { jobLocationType: 'TELECOMMUTE', applicantLocationRequirements: { '@type': 'Country', name: 'VN' } } : {}),
    ...(city || !remote ? { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: city || undefined, addressCountry: 'VN' } } } : {}),
    directApply: true,
  };
}
