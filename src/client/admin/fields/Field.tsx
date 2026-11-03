import { useState } from 'react';
import { iconNames } from '../../../shared/icons.ts';
import { rich } from '../../../shared/rich.ts';
import { useAdmin } from '../state/AdminContext.tsx';
import { getPath, setPath } from '../lib/path.ts';
import { errMsg, uploadFile } from '../lib/api.ts';
import { useToast } from '../ui/Toast.tsx';
import { Icon, Svg } from '../ui/Icon.tsx';
import { ListEditor } from './ListEditor.tsx';
import type { FieldSpec, Item } from '../schema.ts';

/**
 * One editor for one field of `obj` (edited in place). Inputs are uncontrolled so typing with
 * Vietnamese input methods is never interrupted; the page re-mounts editors when the draft is replaced.
 */
export function Field({ obj, f }: { obj: Item; f: FieldSpec }) {
  const { change } = useAdmin();
  const get = () => (f.literal ? obj[f.key] : getPath(obj, f.key));
  const set = (v: unknown) => {
    if (f.literal) obj[f.key] = v;
    else setPath(obj, f.key, v);
    change();
  };
  const value = get();
  const label = <div className="f__label">{f.label}</div>;

  switch (f.type) {
    case 'text':
      return (
        <label className="f">
          {label}
          <input type="text" defaultValue={value ?? ''} placeholder={f.placeholder ?? ''} onInput={(e) => set(e.currentTarget.value)} />
        </label>
      );
    case 'area':
      return (
        <label className="f">
          {label}
          <textarea rows={f.rows ?? 4} defaultValue={value ?? ''} onInput={(e) => set(e.currentTarget.value)} />
        </label>
      );
    case 'date':
      return (
        <label className="f">
          {label}
          <input type="date" defaultValue={value ?? ''} onInput={(e) => set(e.currentTarget.value)} />
        </label>
      );
    case 'select':
      return (
        <label className="f">
          {label}
          <select defaultValue={value} onChange={(e) => set(e.currentTarget.value)}>
            {f.options!.map(([v, text]) => (
              <option value={v} key={v}>
                {text}
              </option>
            ))}
          </select>
        </label>
      );
    case 'bool':
      return (
        <label className="f f--check">
          <input type="checkbox" defaultChecked={!!value} onChange={(e) => set(e.currentTarget.checked)} />
          <span>{f.label}</span>
        </label>
      );
    case 'tags':
      return (
        <label className="f">
          {label}
          <input
            type="text"
            defaultValue={(value ?? []).join(', ')}
            placeholder="Cách nhau bằng dấu phẩy"
            onInput={(e) => set(e.currentTarget.value.split(',').map((x) => x.trim()).filter(Boolean))}
          />
        </label>
      );
    case 'i18n':
    case 'i18n-area':
    case 'i18n-lines':
      return <I18nField f={f} value={value} get={get} set={set} />;
    case 'icon':
      return <IconField f={f} value={value} set={set} />;
    case 'image':
      return <ImageField label={f.label} value={value} set={set} />;
    case 'list':
      return <ListEditor obj={obj} f={f} />;
  }
}

function I18nField({ f, value, get, set }: { f: FieldSpec; value: any; get: () => any; set: (v: unknown) => void }) {
  const lines = f.type === 'i18n-lines';
  const v = value ?? { vi: lines ? [] : '', en: lines ? [] : '' };
  const hasMarkup = (s: unknown) => typeof s === 'string' && /\[|\*\*|\n/.test(s);
  const [preview, setPreview] = useState<{ vi: string; en: string }>({ vi: lines ? '' : v.vi, en: lines ? '' : v.en });

  const input = (lang: 'vi' | 'en') => {
    const cur = v[lang] ?? '';
    const props = {
      'aria-label': `${f.label} (${lang.toUpperCase()})`,
      onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const raw = e.currentTarget.value;
        const next = { ...(get() ?? {}) };
        next[lang] = lines ? raw.split('\n').map((x) => x.trim()).filter(Boolean) : raw;
        set(next);
        if (!lines) setPreview((p) => ({ ...p, [lang]: raw }));
      },
    };
    if (f.type === 'i18n') return <input type="text" defaultValue={cur} {...props} />;
    return <textarea rows={lines ? Math.max(3, (cur.length ?? 0) + 1) : (f.rows ?? 3)} defaultValue={Array.isArray(cur) ? cur.join('\n') : cur} {...props} />;
  };
  return (
    <div className="f">
      <div className="f__label">{f.label}</div>
      {lines && <div className="f__hint">Mỗi dòng là một mục.</div>}
      <div className="f__pair">
        {(['vi', 'en'] as const).map((lang) => (
          <div key={lang}>
            <span className="f__lang">{lang.toUpperCase()}</span>
            {input(lang)}
            <div className="f__preview" dangerouslySetInnerHTML={{ __html: !lines && hasMarkup(preview[lang]) ? rich(preview[lang]) : '' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function IconField({ f, value, set }: { f: FieldSpec; value: string | undefined; set: (v: unknown) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="f">
      <div className="f__label">{f.label}</div>
      <div className="iconpick">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen((o) => !o)}>
          <span className="iconpick__current">
            <Svg name={value} />
          </span>
          <span>{value ?? 'chọn'}</span>
        </button>
        <div className="iconpick__grid" hidden={!open}>
          {(f.only ?? iconNames).map((n) => (
            <button type="button" key={n} className={`iconpick__opt${n === value ? ' is-on' : ''}`} title={n} onClick={() => set(n)}>
              <Svg name={n} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ImageField({ label, value, set }: { label: string; value: string | undefined; set: (v: string) => void }) {
  const toast = useToast();
  const [url, setUrl] = useState(value ?? '');
  const update = (u: string) => {
    setUrl(u);
    set(u);
  };
  return (
    <div className="f">
      <div className="f__label">{label}</div>
      <div className="f__imgrow">
        <img className="f__img" src={url || undefined} alt="" hidden={!url} />
        <div className="f__imgctl">
          <input type="text" value={url} placeholder="/uploads/..." onChange={(e) => update(e.currentTarget.value)} />
          <div>
            <label className="btn btn--ghost btn--sm">
              <Icon name="cloud-download" />
              Tải ảnh lên
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={async (e) => {
                  const file = e.currentTarget.files?.[0];
                  if (!file) return;
                  try {
                    update((await uploadFile(file)).url);
                    toast('Đã tải ảnh lên.');
                  } catch (err) {
                    toast(errMsg(err), 'err');
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
