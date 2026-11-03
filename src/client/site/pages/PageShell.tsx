import type { ReactNode } from 'react';
import { HomeStateProvider } from '../context.tsx';
import { Header } from '../components/Header/Header.tsx';
import { Footer } from '../components/Footer/Footer.tsx';
import { FloatingActions } from '../components/FloatingActions/FloatingActions.tsx';

/** Header + footer for pages other than the homepage (blog, privacy). */
export function PageShell({ active, mainClass, children }: { active?: string; mainClass?: string; children: ReactNode }) {
  return (
    <HomeStateProvider>
      <FloatingActions fab={false} />
      <Header home={false} active={active} />
      <main id="top" className={mainClass}>
        {children}
      </main>
      <Footer home={false} />
    </HomeStateProvider>
  );
}
