// Shape of everything stored in data/ — shared by the server, the site and the admin.
import type { ApplicantProfile } from './apply.ts';

export type Lang = 'vi' | 'en';
export interface I18n {
  vi: string;
  en: string;
}
export interface I18nList {
  vi: string[];
  en: string[];
}

export interface Link {
  label: I18n;
  href: string;
}
export interface SocialLink {
  icon: string;
  label: string;
  url: string;
}
export interface ExtraContact {
  icon: string;
  label: I18n;
  url: string;
}

export interface Settings {
  siteName: string;
  email: string;
  phone: string;
  zalo: string;
  address: I18n;
  floatingContact: boolean;
  seo: {
    title: I18n;
    description: I18n;
    /** Search Console / Bing Webmaster verification codes (content of the meta tag) */
    google?: string;
    bing?: string;
    /** Title/description of listing pages; empty = built-in text */
    pages?: Partial<Record<'blog' | 'careers' | 'projects', { title: I18n; description: I18n }>>;
  };
  nav: Link[];
  footerLinks: Link[];
  social: SocialLink[];
  extraContacts: ExtraContact[];
}

export interface SectionEntry {
  id: string;
  enabled: boolean;
  custom?: boolean;
}

export interface Service {
  id: string;
  icon: string;
  title: I18n;
  desc: I18n;
  tags: string[];
  items: I18nList;
  stack: string[];
}
export interface IconCard {
  icon: string;
  title: I18n;
  desc: I18n;
}
export interface Audience extends IconCard {
  points: I18nList;
}
export interface Step {
  title: I18n;
  desc: I18n;
}
export interface Stat {
  value: string;
  label: I18n;
}
export interface TechGroup {
  name: I18n;
  items: string[];
}
export interface Engagement {
  featured: boolean;
  name: I18n;
  desc: I18n;
  best: I18n;
  points: I18nList;
}
export interface Project {
  title: I18n;
  desc: I18n;
  tags: string[];
  image: string;
  /** Live site / product link */
  url: string;
  // ---- optional case study (own page at /projects/<slug> when body, results or gallery is filled) ----
  slug?: string;
  client?: I18n;
  year?: string;
  industry?: I18n;
  services?: I18n;
  results?: Stat[];
  /** Article format, same as blog posts */
  body?: I18n;
  gallery?: Array<{ image: string; caption?: I18n }>;
}
export interface Value {
  icon: string;
  name: string;
  desc: I18n;
}
export interface Faq {
  q: I18n;
  a: I18n;
}
export interface Job {
  id: string;
  open: boolean;
  title: I18n;
  department?: I18n;
  location?: I18n;
  type?: I18n;
  salary?: I18n;
  deadline?: string;
  /** Date the role was posted (YYYY-MM-DD); used for Google Jobs */
  posted?: string;
  summary?: I18n;
  description?: I18n;
  requirements?: I18nList;
  benefits?: I18nList;
}

export interface ButtonSpec {
  label: I18n;
  href: string;
}
export interface CustomBlock {
  id: string;
  type: 'text' | 'cards' | 'media' | 'cta' | 'gallery';
  eyebrow?: I18n;
  title?: I18n;
  desc?: I18n;
  body?: I18n;
  image?: string;
  imageSide?: 'left' | 'right';
  button?: ButtonSpec;
  items?: Array<{ icon?: string; title?: I18n; desc?: I18n; url?: string; image?: string; caption?: I18n }>;
}

export interface PrivacyLang {
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
}

export interface SiteContent {
  version: number;
  migrations?: string[];
  settings: Settings;
  sections: SectionEntry[];
  text: Record<string, I18n>;
  heroTags: string[];
  stats: Stat[];
  terminal: I18nList;
  marquee: string[];
  services: Service[];
  audience: Audience[];
  steps: Step[];
  reasons: IconCard[];
  security: {
    services: IconCard[];
    steps: Step[];
    principles: I18nList;
    report: I18nList;
    severity: string[];
  };
  techGroups: TechGroup[];
  engagement: Engagement[];
  projects: Project[];
  custom: CustomBlock[];
  values: Value[];
  faq: Faq[];
  jobs: Job[];
  privacy: { updated: string; vi: PrivacyLang; en: PrivacyLang };
}

export interface StoredContent {
  rev: number;
  updatedAt: string;
  updatedBy: string;
  content: SiteContent;
}

export interface Post {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  title: I18n;
  excerpt: I18n;
  body: I18n;
  cover: string;
  category: I18n;
  tags: string[];
  author: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PostSummary {
  slug: string;
  title: I18n;
  excerpt: I18n;
  cover: string;
  category: I18n;
  tags: string[];
  author: string;
  date: string;
  minutes: number;
}

export type Role = 'admin' | 'editor';
export interface User {
  username: string;
  role: Role;
  password: string;
  createdAt: string;
  lastLoginAt?: string | null;
}
export type PublicUser = Omit<User, 'password'>;

export interface Contact {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  lang: Lang;
  consent?: boolean;
  ip?: string;
  at: string;
  read: boolean;
}

export type ApplicationStatus = 'new' | 'reviewing' | 'interview' | 'passed' | 'offer' | 'hired' | 'rejected';
export interface Interview {
  /** local date-time "YYYY-MM-DDTHH:mm" (Vietnam time) */
  at: string;
  /** office address or meeting link */
  place: string;
  interviewer: string;
  note: string;
}
export interface ApplicationLog {
  at: string;
  by: string;
  text: string;
}
export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  cvLink: string;
  message: string;
  lang: Lang;
  consent: boolean;
  ip?: string;
  at: string;
  status: ApplicationStatus;
  note: string;
  cvFile: string | null;
  /** Portrait uploaded with the form (private, admin only) */
  photoFile?: string | null;
  /** Filled in on the site's application form (older applications have none) */
  profile?: ApplicantProfile;
  /** Recruiter's rating 1–5 (0 = not rated) */
  rating?: number;
  interview?: Interview | null;
  /** What happened to this application (status changes, interview, notes) */
  log?: ApplicationLog[];
}

/** What the server hands to a server-rendered site page (also inlined for hydration). */
export type PageData =
  | { page: 'home'; lang: Lang; content: SiteContent; latestPosts: PostSummary[] }
  | { page: 'privacy'; lang: Lang; content: SiteContent }
  | { page: 'blog'; lang: Lang; content: SiteContent; posts: PostSummary[]; category: string; tag: string; q: string; pageNo: number }
  | {
      page: 'post';
      lang: Lang;
      content: SiteContent;
      post: Post;
      related: PostSummary[];
      url: string;
      /** Newer / older neighbours in the blog's order */
      newer: PostSummary | null;
      older: PostSummary | null;
    }
  | { page: 'careers'; lang: Lang; content: SiteContent }
  | { page: 'projects'; lang: Lang; content: SiteContent }
  | { page: 'project'; lang: Lang; content: SiteContent; slug: string; url: string }
  | { page: 'job'; lang: Lang; content: SiteContent; jobId: string; url: string }
  | { page: 'notfound'; lang: Lang; content: SiteContent };
