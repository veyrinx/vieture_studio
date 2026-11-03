import { useMemo, type ReactNode } from 'react';
import { HomeStateProvider, useSite } from '../../context.tsx';
import { SectionInfoContext } from '../../ui/Section.tsx';
import { pad } from '../../ui/format.ts';
import { useReveal } from '../../hooks/useReveal.ts';
import { Header } from '../../components/Header/Header.tsx';
import { Footer } from '../../components/Footer/Footer.tsx';
import { FloatingActions } from '../../components/FloatingActions/FloatingActions.tsx';
import { Hero } from '../../components/Hero/Hero.tsx';
import { Marquee } from '../../components/Marquee/Marquee.tsx';
import { About } from '../../components/About/About.tsx';
import { Audience } from '../../components/Audience/Audience.tsx';
import { Services } from '../../components/Services/Services.tsx';
import { Solutions } from '../../components/Solutions/Solutions.tsx';
import { Security } from '../../components/Security/Security.tsx';
import { Band } from '../../components/Band/Band.tsx';
import { Why } from '../../components/Why/Why.tsx';
import { Process } from '../../components/Process/Process.tsx';
import { Projects } from '../../components/Projects/Projects.tsx';
import { Tech } from '../../components/Tech/Tech.tsx';
import { Engage } from '../../components/Engage/Engage.tsx';
import { Mission } from '../../components/Mission/Mission.tsx';
import { Values } from '../../components/Values/Values.tsx';
import { Direction } from '../../components/Direction/Direction.tsx';
import { Faq } from '../../components/Faq/Faq.tsx';
import { News } from '../../components/News/News.tsx';
import { Careers } from '../../components/Careers/Careers.tsx';
import { Contact } from '../../components/Contact/Contact.tsx';
import { CustomBlock, customEyebrows } from '../../components/CustomBlock/CustomBlock.tsx';
import type { PostSummary } from '../../../../shared/types.ts';

/** Built-in sections: component + how many "01 — …" eyebrow labels it shows. */
const BUILT_IN: Record<string, { render: (posts: PostSummary[]) => ReactNode; eyebrows: number; zebra?: false }> = {
  marquee: { render: () => <Marquee />, eyebrows: 0, zebra: false },
  about: { render: () => <About />, eyebrows: 1 },
  audience: { render: () => <Audience />, eyebrows: 1 },
  services: { render: () => <Services />, eyebrows: 1 },
  solutions: { render: () => <Solutions />, eyebrows: 1 },
  security: { render: () => <Security />, eyebrows: 1 },
  band: { render: () => <Band />, eyebrows: 0 },
  why: { render: () => <Why />, eyebrows: 1 },
  process: { render: () => <Process />, eyebrows: 1 },
  projects: { render: () => <Projects />, eyebrows: 1 },
  tech: { render: () => <Tech />, eyebrows: 1 },
  engage: { render: () => <Engage />, eyebrows: 1 },
  mission: { render: () => <Mission />, eyebrows: 2 },
  values: { render: () => <Values />, eyebrows: 1 },
  direction: { render: () => <Direction />, eyebrows: 1 },
  faq: { render: () => <Faq />, eyebrows: 1 },
  news: { render: (posts) => <News posts={posts} />, eyebrows: 1 },
  careers: { render: () => <Careers />, eyebrows: 1 },
  contact: { render: () => <Contact />, eyebrows: 1 },
};

export function Home({ latestPosts }: { latestPosts: PostSummary[] }) {
  const { C, L, lang } = useSite();

  // Visible sections in admin order, with zebra backgrounds and running eyebrow numbers.
  const layout = useMemo(() => {
    const custom = new Map(C.custom.map((b) => [b.id, b]));
    const empty = (id: string) => (id === 'projects' && !C.projects.length) || (id === 'news' && !latestPosts.length);
    const rows = C.sections
      .filter((s) => s.enabled !== false && !empty(s.id) && (BUILT_IN[s.id] || custom.has(s.id)))
      .map((s) => ({ id: s.id, block: custom.get(s.id) }));
    let n = 0;
    let zebra = 0;
    return rows.map(({ id, block }) => {
      const def = BUILT_IN[id];
      const first = n;
      n += block ? customEyebrows(block, L) : def.eyebrows;
      const alt = def?.zebra === false ? false : zebra++ % 2 === 1;
      return { id, block, alt, eyebrow: (label: string, k = 0) => `${pad(first + k + 1)} — ${label.replace(/^\d+ — /, '')}` };
    });
  }, [C, L, latestPosts.length]);
  const visible = useMemo(() => new Set(layout.map((r) => r.id)), [layout]);

  useReveal([lang]);

  return (
    <HomeStateProvider>
      <FloatingActions />
      <Header home visible={visible} />
      <main id="top">
        <Hero />
        {layout.map((r) => (
          <SectionInfoContext.Provider value={{ alt: r.alt, eyebrow: r.eyebrow }} key={r.id}>
            {r.block ? <CustomBlock b={r.block} /> : BUILT_IN[r.id].render(latestPosts)}
          </SectionInfoContext.Provider>
        ))}
      </main>
      <Footer home visible={visible} />
    </HomeStateProvider>
  );
}
