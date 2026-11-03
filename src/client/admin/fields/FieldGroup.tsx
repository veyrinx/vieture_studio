import { Field } from './Field.tsx';
import type { FieldSpec, Item } from '../schema.ts';

/** Lists render their own panel; every other field sits in a .group panel. */
export function FieldBlock({ obj, f }: { obj: Item; f: FieldSpec }) {
  if (f.type === 'list') return <Field obj={obj} f={f} />;
  return (
    <div className="group">
      <Field obj={obj} f={f} />
    </div>
  );
}
