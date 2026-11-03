import { createContext, useContext, useState, type ReactNode } from 'react';
import type { I18n, I18nList, Lang, PageData, SiteContent } from '../../shared/types.ts';

export interface Site {
  data: PageData;
  C: SiteContent;
  lang: Lang;
  /** Localised value of a {vi, en} pair (falls back to Vietnamese). */
  L: <T extends I18n | I18nList>(pair: T | undefined) => T extends I18nList ? string[] : string;
  /** Text by key from content.text */
  t: (key: string) => string;
  /** Link to a page in the current language, e.g. href('/blog') → /blog?lang=en */
  href: (path: string) => string;
}

const SiteContext = createContext<Site | null>(null);

export function makeSite(data: PageData): Site {
  const { content: C, lang } = data;
  const L = ((pair: I18n | I18nList | undefined) => {
    if (!pair) return '';
    const v = pair[lang];
    return (Array.isArray(v) ? (v.length ? v : pair.vi) : v || pair.vi) ?? '';
  }) as Site['L'];
  return {
    data,
    C,
    lang,
    L,
    t: (key) => L(C.text[key]),
    href: (path) => (lang === 'en' && path.startsWith('/') ? `${path}${path.includes('?') ? '&' : '?'}lang=en` : path),
  };
}

export function SiteProvider({ data, children }: { data: PageData; children: ReactNode }) {
  return <SiteContext.Provider value={makeSite(data)}>{children}</SiteContext.Provider>;
}

export function useSite(): Site {
  const site = useContext(SiteContext);
  if (!site) throw new Error('useSite outside SiteProvider');
  return site;
}

// ---------- homepage cross-section state: selected solution tab + contact topic ----------
interface HomeState {
  tab: number;
  setTab: (i: number) => void;
  topic: number;
  setTopic: (i: number) => void;
}
const HomeContext = createContext<HomeState>({ tab: 0, setTab: () => {}, topic: 0, setTopic: () => {} });

export function HomeStateProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState(0);
  const [topic, setTopic] = useState(0);
  return <HomeContext.Provider value={{ tab, setTab, topic, setTopic }}>{children}</HomeContext.Provider>;
}
export const useHomeState = () => useContext(HomeContext);
