import { icons } from '../../../shared/icons.ts';

const paths = (name: string | undefined) => (name && Object.hasOwn(icons, name) ? icons[name] : icons.star);

export const Svg = ({ name }: { name: string | undefined }) => <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths(name) }} />;

/** Icon wrapped the way the admin stylesheet expects (span.i). */
export const Icon = ({ name }: { name: string | undefined }) => (
  <span className="i">
    <Svg name={name} />
  </span>
);
