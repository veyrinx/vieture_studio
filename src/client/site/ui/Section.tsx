import { createContext, useContext, type ReactNode } from 'react';

/** Per-section layout info computed by the homepage: zebra background + "01 — " eyebrow numbers. */
export interface SectionInfo {
  alt: boolean;
  /** eyebrow(label, k) → "07 — label" (k = index of the eyebrow inside the section) */
  eyebrow: (label: string, k?: number) => string;
}
export const SectionInfoContext = createContext<SectionInfo>({ alt: false, eyebrow: (l) => l });
export const useSection = () => useContext(SectionInfoContext);

export function Section({ id, className = '', children }: { id: string; className?: string; children: ReactNode }) {
  const { alt } = useSection();
  return (
    <section id={id} className={`section${className ? ` ${className}` : ''}${alt ? ' section--alt' : ''}`}>
      {children}
    </section>
  );
}
