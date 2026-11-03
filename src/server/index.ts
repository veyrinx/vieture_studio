// VieTure Studio server: API, admin, and server-side rendering (React) of the public pages.
//   development:  node src/server/index.ts          (Vite middleware, hot reload, one port)
//   production:   NODE_ENV=production node src/server/index.ts   (serves the build in dist/)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import nodemailer from 'nodemailer';
import { createStore } from './services/store.ts';
import { checkPasswordStrength, hashPassword } from './services/auth.ts';
import { hasCaseStudy, projectSlug } from '../shared/project.ts';
import { SITE, absolute, articleJsonLd, jobPostingJsonLd, openJobs, publishedPosts, rss, sitemap, summary } from './services/blog.ts';
import { telegramReady } from './services/notify.ts';
import { ogVersion, renderOg, type OgCard } from './services/og.tsx';
import { readingTime } from '../shared/article.ts';
import { adminRouter } from './routes/admin.ts';
import { formsRouter } from './routes/forms.ts';
import { escapeHtml, plainText } from '../shared/rich.ts';
import type { Lang, PageData } from '../shared/types.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const transporter = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const store = createStore(dataDir);
await store.init();
await bootstrapAdmin();

const app = express();
app.disable('x-powered-by');
// TRUST_PROXY: a hop count ("1" = one reverse proxy such as Nginx) or an address list ("loopback").
// Env vars are strings, so a hop count must be converted or Express treats "1" as an address.
const trustProxy = process.env.TRUST_PROXY ?? 'loopback';
app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);

// One address for the whole site: http://, www. and the bare server IP permanently redirect to SITE_URL
// (otherwise search engines index several copies). Behind Cloudflare the visitor's scheme is in CF-Visitor.
const siteUrl = new URL(SITE);
app.use((req, res, next) => {
  if (!isProd || req.path.startsWith('/api/')) return next();
  const host = (req.headers.host ?? '').toLowerCase().replace(/:\d+$/, '');
  let scheme = req.protocol;
  try {
    scheme = JSON.parse(String(req.headers['cf-visitor'] ?? '{}')).scheme || scheme;
  } catch {
    /* malformed header — keep req.protocol */
  }
  const wrongHost = host === `www.${siteUrl.hostname}` || (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) && !host.startsWith('127.'));
  const wrongScheme = host === siteUrl.hostname && siteUrl.protocol === 'https:' && scheme === 'http';
  if (wrongHost || wrongScheme) return res.redirect(301, `${SITE}${req.originalUrl}`);
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        // Cloudflare Web Analytics beacon (enabled on the Cloudflare zone); Vite's dev client needs eval/ws
        scriptSrc: ["'self'", 'https://static.cloudflareinsights.com', ...(isProd ? [] : ["'unsafe-inline'", "'unsafe-eval'"])],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://cloudflareinsights.com', ...(isProd ? [] : ['ws:'])],
        formAction: ["'self'", 'mailto:'],
        upgradeInsecureRequests: null,
      },
    },
  })
);
app.use(compression());

// ---------- API ----------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, smtp: smtpReady, telegram: telegramReady() });
});
app.get('/api/content', (_req, res) => {
  res.set('Cache-Control', 'no-cache').json(store.getContent().content);
});
app.use('/api/admin', adminRouter(store));
app.use('/api', formsRouter(store, transporter));
app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

// ---------- rendering: Vite in development, the built bundle in production ----------
type Render = (data: PageData) => string;
type Template = (name: 'index.html' | 'admin.html', url: string) => Promise<string>;
let render: () => Promise<Render>;
let template: Template;

if (isProd) {
  const cache = new Map<string, string>();
  template = async (name) => {
    if (!cache.has(name)) cache.set(name, await readFile(path.join(dist, 'client', name), 'utf8'));
    return cache.get(name)!;
  };
  const mod = (await import(pathToFileURL(path.join(dist, 'server', 'entry-server.js')).href)) as { render: Render };
  render = async () => mod.render;
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
  app.use(vite.middlewares);
  template = async (name, url) => vite.transformIndexHtml(url, await readFile(path.join(root, name), 'utf8'));
  render = async () => ((await vite.ssrLoadModule('/src/client/site/entry-server.tsx')) as { render: Render }).render;
}

const langOf = (req: Request): Lang => (req.query.lang === 'en' ? 'en' : 'vi');

interface Head {
  title: string;
  description: string;
  /** Vietnamese (default-language) URL of the page; the English URL adds ?lang=en */
  canonical: string;
  /** false when the page has no English version (English visitors see the Vietnamese text) */
  en?: boolean;
  /** Not-found and search pages: noindex, no canonical/alternates */
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  article?: { published?: string; modified?: string; section?: string; tags?: string[] };
  jsonLd?: object | object[];
  extra?: string;
}

/** https://site/blog?page=2 → https://site/blog?page=2&lang=en */
const withLang = (url: string) => `${url}${url.includes('?') ? '&' : '?'}lang=en`;

/** Accepts the whole <meta … content="CODE"> tag pasted from Search Console, or just the code. */
const verifyCode = (v: string | undefined) => (v?.match(/content=["']([^"']+)["']/)?.[1] ?? v ?? '').replace(/[^\w-]/g, '').slice(0, 100);

function headTags(h: Head, lang: Lang) {
  const s = store.getContent().content.settings;
  const hasEn = h.en !== false;
  const url = lang === 'en' && hasEn ? withLang(h.canonical) : h.canonical;
  const image = h.image ?? `${SITE}/og.png`;
  const meta = (attr: 'name' | 'property', key: string, value: string | undefined) =>
    value ? `<meta ${attr}="${key}" content="${escapeHtml(value)}" />` : '';
  const tags = [
    `<title>${escapeHtml(h.title)}</title>`,
    meta('name', 'description', h.description),
    h.noindex ? '<meta name="robots" content="noindex, follow" />' : meta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1'),
    ...(h.noindex
      ? []
      : [
          `<link rel="canonical" href="${escapeHtml(url)}" />`,
          `<link rel="alternate" hreflang="vi" href="${escapeHtml(h.canonical)}" />`,
          hasEn ? `<link rel="alternate" hreflang="en" href="${escapeHtml(withLang(h.canonical))}" />` : '',
          `<link rel="alternate" hreflang="x-default" href="${escapeHtml(h.canonical)}" />`,
        ]),
    meta('property', 'og:type', h.type ?? 'website'),
    meta('property', 'og:title', h.title),
    meta('property', 'og:description', h.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', image),
    // our own preview images (default and generated) are always 1200×630 PNG
    ...(image === `${SITE}/og.png` || image.startsWith(`${SITE}/og/`)
      ? [meta('property', 'og:image:width', '1200'), meta('property', 'og:image:height', '630'), meta('property', 'og:image:type', 'image/png')]
      : []),
    meta('property', 'og:image:alt', h.imageAlt ?? h.title),
    meta('property', 'og:site_name', s.siteName),
    meta('property', 'og:locale', lang === 'en' ? 'en_US' : 'vi_VN'),
    hasEn ? meta('property', 'og:locale:alternate', lang === 'en' ? 'vi_VN' : 'en_US') : '',
    meta('property', 'article:published_time', h.article?.published),
    meta('property', 'article:modified_time', h.article?.modified),
    meta('property', 'article:section', h.article?.section),
    ...(h.article?.tags ?? []).map((t) => meta('property', 'article:tag', t)),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', h.title),
    meta('name', 'twitter:description', h.description),
    meta('name', 'twitter:image', image),
    meta('name', 'google-site-verification', verifyCode(s.seo.google)),
    meta('name', 'msvalidate.01', verifyCode(s.seo.bing)),
  ];
  if (h.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(h.jsonLd).replace(/</g, '\\u003c')}</script>`);
  if (h.extra) tags.push(h.extra);
  return tags.filter(Boolean).join('\n    ');
}

/** Admin-editable title/description for a listing page, falling back to the built-in text. */
function pageSeo(key: 'blog' | 'careers' | 'projects', lang: Lang, fallback: { title: string; description: string }) {
  const p = store.getContent().content.settings.seo.pages?.[key];
  const L = (v: { vi: string; en: string } | undefined) => plainText(v?.[lang] || v?.vi || '').trim();
  return { title: L(p?.title) || fallback.title, description: L(p?.description) || fallback.description };
}

async function sendPage(req: Request, res: Response, data: PageData, head: Head, status = 200) {
  const [html, doRender] = await Promise.all([template('index.html', req.originalUrl), render()]);
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const page = html
    .replace('<html lang="vi">', `<html lang="${data.lang}">`)
    .replace('<!--app-head-->', headTags(head, data.lang))
    .replace('<!--app-html-->', doRender(data))
    .replace('<!--app-data-->', `<script type="application/json" id="page-data">${json}</script>`);
  res.status(status).set('Cache-Control', 'no-cache').type('html').send(page);
}

/** Shorten to a search-result friendly length without cutting a word in half. */
function clip(text: string, max = 160) {
  const t = plainText(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max * 0.6 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,.;:–—-]+$/, '')}…`;
}

const crumbsLd = (items: Array<[string, string]>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
const homeCrumb = (lang: Lang): [string, string] => [lang === 'en' ? 'Home' : 'Trang chủ', `${SITE}/`];

// ---------- link-preview images ----------
type OgKind = 'job' | 'post' | 'project' | 'page';
const ddmm = (d: string) => d.slice(0, 10).split('-').reverse().join('/');

/** What the preview image of a page shows (null = no such page / use the default image). */
async function ogCard(kind: OgKind, id: string, lang: Lang): Promise<OgCard | null> {
  const content = store.getContent().content;
  const L = (v: { vi: string; en: string } | undefined) => plainText(v?.[lang] || v?.vi || v?.en || '').trim();
  const t = (key: string) => L(content.text[key]);
  const en = lang === 'en';
  if (kind === 'job') {
    if (id === 'general') return { label: t('careers.eyebrow') || 'Tuyển dụng', title: t('careers.generalTitle'), text: t('careers.generalOpen'), cta: en ? 'Send your profile →' : 'Gửi hồ sơ →' };
    const job = openJobs(content.jobs ?? []).find((j) => j.id === id);
    if (!job) return null;
    const chips = [L(job.location), L(job.type), L(job.salary), job.deadline ? `${en ? 'Apply by' : 'Hạn nộp'} ${ddmm(job.deadline)}` : ''].filter(Boolean);
    return { label: en ? "We're hiring" : 'Đang tuyển dụng', title: L(job.title), text: L(job.summary) || undefined, chips, cta: en ? 'Apply now →' : 'Ứng tuyển ngay →' };
  }
  if (kind === 'post') {
    const post = (await publishedPosts(store)).find((p) => p.slug === id);
    if (!post) return null;
    return {
      label: L(post.category) || 'Blog',
      title: L(post.title),
      text: L(post.excerpt) || undefined,
      chips: [post.date ? ddmm(post.date) : '', `${readingTime(L(post.body))} ${en ? 'min read' : 'phút đọc'}`].filter(Boolean),
      cta: en ? 'Read the article →' : 'Đọc bài viết →',
    };
  }
  if (kind === 'project') {
    const p = content.projects.find((x) => hasCaseStudy(x) && projectSlug(x) === id);
    if (!p) return null;
    return { label: en ? 'Case study' : 'Dự án', title: L(p.title), text: L(p.desc) || undefined, chips: p.tags.slice(0, 4), cta: en ? 'View the case study →' : 'Xem case study →' };
  }
  if (id === 'careers') {
    const jobs = openJobs(content.jobs ?? []);
    return { label: t('careers.eyebrow') || 'Tuyển dụng', title: t('careers.title'), text: t('careers.desc'), chips: jobs.slice(0, 3).map((j) => L(j.title)), cta: en ? 'See open roles →' : 'Xem vị trí đang tuyển →' };
  }
  if (id === 'blog') return { label: 'Blog', title: en ? 'News & Blog' : 'Tin tức & Blog', text: pageSeo('blog', lang, { title: '', description: '' }).description || (en ? 'Insights on software, security, AI and cloud.' : 'Kiến thức về phần mềm, bảo mật, AI và Cloud.'), cta: en ? 'Read our articles →' : 'Đọc bài viết →' };
  if (id === 'projects') return { label: en ? 'Projects' : 'Dự án', title: t('projects.title') || (en ? 'Our work' : 'Dự án tiêu biểu'), text: t('projects.desc') || undefined, cta: en ? 'View projects →' : 'Xem dự án →' };
  return null;
}

/** URL of a page's preview image (with a content version so shared links refresh after edits). */
async function ogUrl(kind: OgKind, id: string, lang: Lang) {
  const card = await ogCard(kind, id, lang);
  return card ? `${SITE}/og/${kind}/${encodeURIComponent(id)}.png?v=${ogVersion(card)}${lang === 'en' ? '&lang=en' : ''}` : undefined;
}

app.get('/og/:kind/:id.png', async (req, res, next) => {
  const kind = req.params.kind as OgKind;
  if (!['job', 'post', 'project', 'page'].includes(kind)) return next();
  const lang = langOf(req);
  const card = await ogCard(kind, req.params.id, lang);
  if (!card) return next();
  try {
    const png = await renderOg(card, store.getContent().content.settings.siteName, new URL(SITE).host, isProd ? path.join(dist, 'client') : path.join(root, 'public'));
    res.set('Cache-Control', 'public, max-age=86400').type('png').send(png);
  } catch (err) {
    console.error('[og]', (err as Error).message);
    res.redirect(302, '/og.png');
  }
});

// Pages are React apps loaded from HTML shells; the public URLs have no ".html".
// Old/direct .html URLs permanently redirect to the clean address (one URL per page).
const CLEAN: Record<string, string> = { '/index.html': '/', '/privacy.html': '/privacy', '/admin.html': '/admin', '/blog.html': '/blog' };
app.get(Object.keys(CLEAN), (req, res) => {
  const qs = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
  res.redirect(301, CLEAN[req.path] + qs);
});

app.get('/', async (req, res) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const s = content.settings;
  const latestPosts = (await publishedPosts(store)).slice(0, 3).map(summary);
  const org = `${SITE}/#organization`;
  const faqOn = content.sections.some((x) => x.id === 'faq' && x.enabled) && content.faq.length > 0;
  const L = (v: { vi: string; en: string } | undefined) => plainText(v?.[lang] || v?.vi || '');
  await sendPage(req, res, { page: 'home', lang, content, latestPosts }, {
    title: plainText(s.seo.title[lang]),
    description: clip(s.seo.description[lang], 170),
    canonical: `${SITE}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': org,
          name: s.siteName,
          url: `${SITE}/`,
          logo: { '@type': 'ImageObject', url: `${SITE}/brand/icon-512.png`, width: 512, height: 512 },
          image: `${SITE}/og.png`,
          slogan: 'Build Ideas. Engineer the Future.',
          description: plainText(s.seo.description[lang]),
          email: s.email || undefined,
          telephone: s.phone || undefined,
          address: L(s.address) ? { '@type': 'PostalAddress', streetAddress: L(s.address), addressCountry: 'VN' } : undefined,
          sameAs: (() => {
            const links = s.social.map((x) => x.url).filter((u) => /^https:\/\/[^/]+\.[^/]+\/./.test(u));
            return links.length ? links : undefined;
          })(),
          contactPoint: s.email || s.phone ? [{ '@type': 'ContactPoint', contactType: 'customer support', email: s.email || undefined, telephone: s.phone || undefined, availableLanguage: ['Vietnamese', 'English'] }] : undefined,
          knowsAbout: content.services.map((x) => L(x.title)).filter(Boolean),
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE}/#website`,
          url: `${SITE}/`,
          name: s.siteName,
          inLanguage: ['vi', 'en'],
          publisher: { '@id': org },
          potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/blog?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
        },
        ...(faqOn
          ? [{ '@type': 'FAQPage', '@id': `${SITE}/#faq`, mainEntity: content.faq.map((f) => ({ '@type': 'Question', name: L(f.q), acceptedAnswer: { '@type': 'Answer', text: L(f.a) } })).filter((x) => x.name) }]
          : []),
      ],
    },
    extra: `<link rel="preload" as="image" href="/brand/logo-400.webp" type="image/webp" />`,
  });
});

app.get('/privacy', async (req, res) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const p = content.privacy[lang];
  await sendPage(req, res, { page: 'privacy', lang, content }, {
    title: `${plainText(p.title)} — ${content.settings.siteName}`,
    description: clip(p.intro),
    canonical: `${SITE}/privacy`,
    en: Boolean(content.privacy.en?.title),
  });
});

// ---------- blog ----------
app.get('/blog/rss.xml', async (_req, res) => {
  res.type('application/rss+xml').send(rss(await publishedPosts(store), store.getContent().content.settings.siteName));
});
app.get('/sitemap.xml', async (_req, res) => {
  const stored = store.getContent();
  const content = stored.content;
  res.type('application/xml').send(sitemap(await publishedPosts(store), openJobs(content.jobs ?? []), content.projects.filter(hasCaseStudy), stored.updatedAt));
});

app.get(['/blog', '/blog/'], async (req, res) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const site = content.settings.siteName;
  const clean = (v: unknown) => String(v ?? '').replace(/[^a-z0-9-]/g, '').slice(0, 80);
  const category = clean(req.query.cat);
  const tag = clean(req.query.tag);
  const q = String(req.query.q ?? '').trim().slice(0, 100);
  const pageNo = Math.max(1, Math.min(999, parseInt(String(req.query.page ?? '1'), 10) || 1));
  const T = lang === 'en' ? { blog: 'News & Blog', page: 'Page' } : { blog: 'Tin tức & Blog', page: 'Trang' };
  const seo = pageSeo('blog', lang, {
    title: `${T.blog} — ${site}`,
    description:
      lang === 'en'
        ? `News, insights and hands-on experience in software, cybersecurity, AI, cloud and digital transformation from the ${site} team.`
        : `Tin tức, kiến thức và kinh nghiệm thực tế về phần mềm, an ninh mạng, AI, Cloud và chuyển đổi số từ đội ngũ ${site}.`,
  });
  const title = pageNo > 1 ? `${seo.title} — ${T.page} ${pageNo}` : seo.title;
  const description = seo.description;
  const posts = (await publishedPosts(store)).map(summary);
  const qs = new URLSearchParams();
  if (category) qs.set('cat', category);
  if (tag) qs.set('tag', tag);
  if (pageNo > 1) qs.set('page', String(pageNo));
  await sendPage(req, res, { page: 'blog', lang, content, posts, category, tag, q, pageNo }, {
    title,
    description,
    canonical: `${SITE}/blog${qs.size ? `?${qs}` : ''}`,
    // search results are not pages of their own
    noindex: Boolean(q),
    image: await ogUrl('page', 'blog', lang),
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Blog', '@id': `${SITE}/blog#blog`, name: seo.title, description, url: `${SITE}/blog`, inLanguage: lang, publisher: { '@id': `${SITE}/#organization` } },
      crumbsLd([homeCrumb(lang), [T.blog, `${SITE}/blog`]]),
    ],
  });
});

app.get('/blog/:slug', async (req, res, next) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const site = content.settings.siteName;
  const posts = await publishedPosts(store);
  const at = posts.findIndex((p) => p.slug === req.params.slug);
  if (at < 0) return next();
  const post = posts[at];
  const L = (v: { vi: string; en: string } | undefined) => v?.[lang] || v?.vi || v?.en || '';
  const cat = L(post.category);
  const related = posts
    .filter((p) => p !== post && cat && L(p.category) === cat)
    .concat(posts.filter((p) => p !== post && L(p.category) !== cat))
    .slice(0, 3)
    .map(summary);
  const url = `${SITE}/blog/${post.slug}`;
  const newer = at > 0 ? summary(posts[at - 1]) : null;
  const older = at < posts.length - 1 ? summary(posts[at + 1]) : null;
  const crumbs: Array<[string, string]> = [homeCrumb(lang), [lang === 'en' ? 'News & Blog' : 'Tin tức & Blog', `${SITE}/blog`], [plainText(L(post.title)), url]];
  await sendPage(req, res, { page: 'post', lang, content, post, related, url, newer, older }, {
    title: `${plainText(L(post.title))} — ${site}`,
    description: clip(L(post.excerpt) || L(post.body)),
    canonical: url,
    en: Boolean(post.title.en?.trim() && post.body.en?.trim()),
    image: post.cover ? absolute(post.cover) : await ogUrl('post', post.slug, lang),
    imageAlt: plainText(L(post.title)),
    type: 'article',
    article: { published: post.date || undefined, modified: (post.updatedAt || post.date || '').slice(0, 10) || undefined, section: plainText(cat) || undefined, tags: post.tags },
    jsonLd: [articleJsonLd(post, site, lang), crumbsLd(crumbs)],
  });
});

// ---------- projects ----------
app.get(['/projects', '/projects/'], async (req, res) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const site = content.settings.siteName;
  const seo = pageSeo('projects', lang, {
    title: `${lang === 'en' ? 'Projects & case studies' : 'Dự án & Case study'} — ${site}`,
    description:
      lang === 'en'
        ? `Selected work by ${site}: management software, websites, apps and digital solutions — the problem, our approach and real results.`
        : `Các dự án tiêu biểu do ${site} thực hiện: phần mềm quản lý, website, ứng dụng và giải pháp số — bài toán, cách làm và kết quả thực tế.`,
  });
  await sendPage(req, res, { page: 'projects', lang, content }, {
    ...seo,
    canonical: `${SITE}/projects`,
    image: await ogUrl('page', 'projects', lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seo.title,
        url: `${SITE}/projects`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: content.projects.filter(hasCaseStudy).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/projects/${projectSlug(p)}`, name: plainText(p.title[lang] || p.title.vi) })),
        },
      },
      crumbsLd([homeCrumb(lang), [lang === 'en' ? 'Projects' : 'Dự án', `${SITE}/projects`]]),
    ],
  });
});

app.get('/projects/:slug', async (req, res, next) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const site = content.settings.siteName;
  const p = content.projects.find((x) => hasCaseStudy(x) && projectSlug(x) === req.params.slug);
  if (!p) return next();
  const L = (v: { vi: string; en: string } | undefined) => v?.[lang] || v?.vi || v?.en || '';
  const url = `${SITE}/projects/${projectSlug(p)}`;
  const name = plainText(L(p.title));
  await sendPage(req, res, { page: 'project', lang, content, slug: projectSlug(p), url }, {
    title: `${name} — ${lang === 'en' ? 'Case study' : 'Dự án'} ${site}`,
    description: clip(L(p.desc) || L(p.body)),
    canonical: url,
    en: Boolean(p.title.en?.trim() && p.desc.en?.trim()),
    image: p.image ? absolute(p.image) : await ogUrl('project', projectSlug(p), lang),
    imageAlt: name,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name,
        headline: name,
        description: plainText(L(p.desc)),
        image: p.image ? [absolute(p.image)] : undefined,
        url,
        dateCreated: /^\d{4}$/.test(p.year ?? '') ? p.year : undefined,
        keywords: p.tags?.join(', ') || undefined,
        creator: { '@id': `${SITE}/#organization`, '@type': 'Organization', name: site, url: `${SITE}/` },
        inLanguage: lang,
      },
      crumbsLd([homeCrumb(lang), [lang === 'en' ? 'Projects' : 'Dự án', `${SITE}/projects`], [name, url]]),
    ],
  });
});

// ---------- careers ----------
const CAREERS_T = {
  vi: { title: 'Tuyển dụng', desc: (site: string) => `Cơ hội việc làm tại ${site}: lập trình, bảo mật, AI, thiết kế. Dự án thực tế, môi trường linh hoạt. Ứng tuyển trực tuyến hoặc gửi CV tự do.`, general: 'Ứng tuyển tự do' },
  en: { title: 'Careers', desc: (site: string) => `Careers at ${site}: software, security, AI and design roles. Real projects, flexible work. Apply online or send an open application.`, general: 'Open application' },
};

app.get(['/careers', '/careers/'], async (req, res) => {
  const lang = langOf(req);
  const content = store.getContent().content;
  const site = content.settings.siteName;
  const seo = pageSeo('careers', lang, { title: `${CAREERS_T[lang].title} — ${lang === 'en' ? 'Jobs at' : 'Việc làm tại'} ${site}`, description: CAREERS_T[lang].desc(site) });
  await sendPage(req, res, { page: 'careers', lang, content }, {
    ...seo,
    canonical: `${SITE}/careers`,
    image: await ogUrl('page', 'careers', lang),
    jsonLd: crumbsLd([homeCrumb(lang), [CAREERS_T[lang].title, `${SITE}/careers`]]),
  });
});

app.get('/careers/:id', async (req, res, next) => {
  const lang = langOf(req);
  const stored = store.getContent();
  const content = stored.content;
  const site = content.settings.siteName;
  const id = req.params.id;
  const url = `${SITE}/careers/${encodeURIComponent(id)}`;
  if (id === 'general') {
    return sendPage(req, res, { page: 'job', lang, content, jobId: id, url }, {
      title: `${CAREERS_T[lang].general} — ${site}`,
      description: CAREERS_T[lang].desc(site),
      canonical: url,
      image: await ogUrl('job', 'general', lang),
    });
  }
  const job = openJobs(content.jobs ?? []).find((j) => j.id === id);
  if (!job) return next();
  const L = (v: { vi: string; en: string } | undefined) => v?.[lang] || v?.vi || v?.en || '';
  await sendPage(req, res, { page: 'job', lang, content, jobId: id, url }, {
    title: `${plainText(L(job.title))} — ${CAREERS_T[lang].title} ${site}`,
    description: clip(L(job.summary) || L(job.description)) || CAREERS_T[lang].desc(site),
    canonical: url,
    en: Boolean(job.title.en?.trim()),
    image: await ogUrl('job', job.id, lang),
    imageAlt: `${plainText(L(job.title))} — ${CAREERS_T[lang].title} ${site}`,
    jsonLd: [
      jobPostingJsonLd(job, site, lang, (stored.updatedAt || new Date().toISOString()).slice(0, 10)),
      crumbsLd([homeCrumb(lang), [CAREERS_T[lang].title, `${SITE}/careers`], [plainText(L(job.title)), url]]),
    ],
  });
});

// ---------- admin app ----------
app.get(['/admin', '/admin/'], async (req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }).type('html').send(await template('admin.html', req.originalUrl));
});

// Images uploaded from the admin panel
app.use(
  '/uploads',
  express.static(store.files.uploads, {
    index: false,
    dotfiles: 'deny',
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
    },
  })
);

if (isProd) {
  app.use(
    express.static(path.join(dist, 'client'), {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    })
  );
}

app.use(async (req, res) => {
  // Missing files (images, scripts…) get a plain 404; missing pages get the site's 404 page.
  if (req.method !== 'GET' || path.extname(req.path)) return res.status(404).type('text').send('404 Not Found');
  const lang = langOf(req);
  const content = store.getContent().content;
  await sendPage(req, res, { page: 'notfound', lang, content }, {
    title: `404 — ${content.settings.siteName}`,
    description: lang === 'en' ? 'Page not found' : 'Không tìm thấy trang',
    canonical: `${SITE}/`,
    noindex: true,
  }, 404);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server]', err);
  if (!res.headersSent) res.status(500).type('text').send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`VieTure Studio server: http://localhost:${PORT} (${isProd ? 'production' : 'development'}, SMTP ${smtpReady ? 'on' : 'off'})`);
});

/** First start: create the first administrator from ADMIN_USERNAME / ADMIN_PASSWORD if there are no users yet. */
async function bootstrapAdmin() {
  const users = await store.getUsers();
  if (users.length) return;
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!username || !password) {
    console.warn('[admin] No admin account yet. Set ADMIN_USERNAME and ADMIN_PASSWORD, or run: node src/server/cli.ts create-user <name> admin');
    return;
  }
  const weak = checkPasswordStrength(password);
  if (weak) {
    console.warn(`[admin] ADMIN_PASSWORD rejected: ${weak}`);
    return;
  }
  await store.saveUsers([{ username, role: 'admin', password: await hashPassword(password), createdAt: new Date().toISOString() }]);
  console.log(`[admin] Created administrator "${username}"`);
}
