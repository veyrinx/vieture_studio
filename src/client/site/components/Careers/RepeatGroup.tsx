import { useState } from 'react';
import { useSite } from '../../context.tsx';
import type { GroupItem, GroupSpec } from '../../../../shared/apply.ts';

const REMOVE = { vi: 'Xoá', en: 'Remove' };
const CHOOSE = { vi: '— Chọn —', en: '— Select —' };

/** A list of entries the candidate can add / remove (schools, jobs, projects…), described by a GroupSpec. */
export function RepeatGroup({ spec, start = 0 }: { spec: GroupSpec; start?: number }) {
  const { lang } = useSite();
  const [ids, setIds] = useState<number[]>(() => Array.from({ length: start }, (_, i) => i + 1));
  return (
    <div className="apply__group" data-group={spec.key}>
      <p className="apply__label">
        {spec.title[lang]}
        {spec.hint && <small>{spec.hint[lang]}</small>}
      </p>
      {ids.map((id, i) => (
        <div className="apply__job" data-entry key={id}>
          <div className="apply__job-head">
            <b>#{i + 1}</b>
            <button type="button" className="apply__remove" onClick={() => setIds((x) => x.filter((y) => y !== id))}>
              {REMOVE[lang]}
            </button>
          </div>
          <div className="apply__grid">
            {spec.fields.map((f) => (
              <label key={f.key} className={f.area ? 'apply__wide' : undefined}>
                <span>{f.label[lang]}</span>
                {f.choices ? (
                  <select data-field={f.key} defaultValue="">
                    <option value="">{CHOOSE[lang]}</option>
                    {Object.entries(f.choices).map(([v, l]) => (
                      <option value={v} key={v}>
                        {l[lang]}
                      </option>
                    ))}
                  </select>
                ) : f.area ? (
                  <textarea data-field={f.key} rows={3} maxLength={f.max} placeholder={f.placeholder?.[lang]} />
                ) : (
                  <input data-field={f.key} type="text" maxLength={f.max} placeholder={f.placeholder?.[lang]} />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      {ids.length < spec.max && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setIds((x) => [...x, Date.now()])}>
          {spec.add[lang]}
        </button>
      )}
    </div>
  );
}

/** Reads every entry of a group from the form (entries without their main field are dropped). */
export function readGroup(form: HTMLFormElement, spec: GroupSpec): GroupItem[] {
  return [...form.querySelectorAll<HTMLElement>(`[data-group="${spec.key}"] [data-entry]`)]
    .map((el) => Object.fromEntries(spec.fields.map((f) => [f.key, (el.querySelector<HTMLInputElement>(`[data-field="${f.key}"]`)?.value ?? '').trim()])))
    .filter((it) => it[spec.main]);
}
