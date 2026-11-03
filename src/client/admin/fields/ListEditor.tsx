import { useEffect, useState } from 'react';
import { useAdmin } from '../state/AdminContext.tsx';
import { L, getPath, keyOf, setPath } from '../lib/path.ts';
import { Icon, Svg } from '../ui/Icon.tsx';
import { Field } from './Field.tsx';
import { takeItem } from '../lib/focus.ts';
import type { FieldSpec, Item } from '../schema.ts';

/** Add / remove / reorder / duplicate items of a list field; each item is a collapsible form. */
export function ListEditor({ obj, f }: { obj: Item; f: FieldSpec }) {
  const { change } = useAdmin();
  const items = (): Item[] => getPath(obj, f.key) ?? (setPath(obj, f.key, []), getPath(obj, f.key));
  const list = items();
  // another page may have just added an item here and asked for it to be opened
  const [openKey, setOpenKey] = useState<number | null>(() => {
    const target = list.find((x) => takeItem(x));
    return target ? keyOf(target) : null;
  });
  const [scrollTo] = useState(openKey);
  useEffect(() => {
    if (scrollTo != null) document.querySelector(`[data-item-key="${scrollTo}"]`)?.scrollIntoView({ block: 'start' });
  }, [scrollTo]);

  const move = (i: number, d: number) => {
    const arr = items();
    [arr[i], arr[i + d]] = [arr[i + d], arr[i]];
    change();
  };
  const duplicate = (i: number) => {
    items().splice(i + 1, 0, structuredClone(items()[i]));
    change();
  };
  const remove = (i: number) => {
    if (!confirm('Xoá mục này?')) return;
    items().splice(i, 1);
    change();
  };
  const add = () => {
    const item = f.template ? f.template() : {};
    items().push(item);
    setOpenKey(keyOf(item));
    change();
  };
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <div className="list">
      <div className="list__head">
        <h3>{f.label}</h3>
        <span className="muted">{list.length} mục</span>
      </div>
      {list.map((item, i) => {
        const title = (f.itemTitle ? f.itemTitle(item, L) : L(item.title) || L(item.name) || item.label) || `Mục ${i + 1}`;
        const k = keyOf(item);
        return (
          <details className="list__item" key={k} data-item-key={k} open={openKey === k || undefined}>
            <summary>
              <span className="list__num">{String(i + 1).padStart(2, '0')}</span>
              {item.icon && <Icon name={item.icon} />}
              <span className="list__title">{String(title).replace(/[[\]*]/g, '')}</span>
              <span className="list__actions">
                <button type="button" title="Lên" disabled={i === 0} onClick={stop(() => move(i, -1))}>
                  ↑
                </button>
                <button type="button" title="Xuống" disabled={i === list.length - 1} onClick={stop(() => move(i, 1))}>
                  ↓
                </button>
                <button type="button" title="Nhân bản" onClick={stop(() => duplicate(i))}>
                  <Svg name="layers" />
                </button>
                <button type="button" className="danger" title="Xoá" onClick={stop(() => remove(i))}>
                  ✕
                </button>
              </span>
            </summary>
            <div className="list__body">
              {f.fields!.map((ff) => (
                <Field obj={item} f={ff} key={ff.key} />
              ))}
            </div>
          </details>
        );
      })}
      <button type="button" className="btn btn--ghost list__add" onClick={add}>
        + Thêm mục
      </button>
    </div>
  );
}
