import { icons } from '../../../shared/icons.ts';

export function Icon({ name, className }: { name: string | undefined; className?: string }) {
  const paths = name && Object.hasOwn(icons, name) ? icons[name] : icons.star;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: paths }} />;
}

export const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
