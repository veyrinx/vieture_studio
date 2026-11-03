import { useRef, useState } from 'react';
import { useAdmin } from '../../state/AdminContext.tsx';
import { L } from '../../lib/path.ts';
import { PageHead } from '../../ui/PageHead.tsx';
import { Field } from '../../fields/Field.tsx';
import { FieldBlock } from '../../fields/FieldGroup.tsx';
import { AddBlockDialog } from './AddBlockDialog.tsx';
import { takeSection } from '../../lib/focus.ts';
import { CUSTOM_TYPES, SECTIONS, textLabel, type Item } from '../../schema.ts';
import type { CustomBlock } from '../../../../shared/types.ts';

export function Content() {
  const { draft: C, change, epoch } = useAdmin();
  const [selected, setSelected] = useState(() => takeSection() ?? 'hero');
  const [adding, setAdding] = useState(false);
  // Long texts get a multi-line box. Decided once per loaded draft, so the box never swaps type
  // (and loses the cursor) while someone is typing.
  const areaKeys = useRef<{ epoch: number; keys: Map<string, boolean> }>({ epoch: -1, keys: new Map() });
  if (areaKeys.current.epoch !== epoch) areaKeys.current = { epoch, keys: new Map() };
  const isArea = (k: string) => {
    const m = areaKeys.current.keys;
    if (!m.has(k)) m.set(k, C.text[k].vi.length > 90 || /\n/.test(C.text[k].vi));
    return m.get(k)!;
  };
  C.custom ??= [];
  const order = C.sections;
  const customOf = (id: string) => C.custom.find((b) => b.id === id);
  const typeOf = (b: CustomBlock | undefined) => CUSTOM_TYPES.find((t) => t.type === b?.type) ?? CUSTOM_TYPES[0];
  const labelOf = (id: string) => {
    const b = customOf(id);
    if (b) return L(b.title) ? L(b.title).replace(/[[\]*]/g, '') : 'Khối mới';
    return SECTIONS.find((x) => x.id === id)?.label ?? id;
  };
  const current = selected !== 'hero' && !order.some((s) => s.id === selected) ? 'hero' : selected;
  const entry = order.find((s) => s.id === current);
  const block = customOf(current);
  const swap = (i: number, j: number) => {
    [order[i], order[j]] = [order[j], order[i]];
    change();
  };
  const pill = entry && <span className={`pill${entry.enabled === false ? ' pill--off' : ''}`}>{entry.enabled === false ? 'Đang ẩn' : 'Đang hiện'}</span>;

  let editor;
  if (block) {
    const t = typeOf(block);
    editor = (
      <div className="editor" key={`${epoch}-${block.id}`}>
        <div className="editor__head">
          <h2>{labelOf(block.id)}</h2>
          <span className="pill">{t.label}</span>
          {pill}
          <a className="btn btn--ghost btn--sm" href={`/#${block.id}`} target="_blank" rel="noopener">
            Xem ↗
          </a>
        </div>
        <p className="note">
          Khối tự thêm — {t.desc} Để đặt link tới khối này trong menu, dùng <code>#{block.id}</code>.
        </p>
        {t.fields.map((f) => (
          <FieldBlock obj={block as unknown as Item} f={f} key={f.key} />
        ))}
        <div className="group group--danger">
          <div>
            <h3>Xoá khối này</h3>
            <p className="muted">Khối sẽ biến mất khỏi trang sau khi bấm "Lưu thay đổi". Có thể khôi phục trong Lịch sử thay đổi.</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm danger"
            onClick={() => {
              if (!confirm('Xoá khối này?')) return;
              C.custom = C.custom.filter((b) => b.id !== block.id);
              C.sections = C.sections.filter((s) => s.id !== block.id);
              setSelected('hero');
              change();
            }}
          >
            Xoá khối
          </button>
        </div>
      </div>
    );
  } else {
    const sec = SECTIONS.find((s) => s.id === current) ?? SECTIONS[0];
    const keys = Object.keys(C.text).filter((k) => (sec.text ?? []).some((p) => k.startsWith(p)));
    editor = (
      <div className="editor" key={`${epoch}-${sec.id}`}>
        <div className="editor__head">
          <h2>{sec.label}</h2>
          {pill}
          <a className="btn btn--ghost btn--sm" href={`/#${sec.id === 'hero' ? 'top' : sec.id}`} target="_blank" rel="noopener">
            Xem ↗
          </a>
        </div>
        {sec.note && <p className="note">{sec.note}</p>}
        {keys.length > 0 && (
          <div className="group">
            <h3>Chữ trong mục</h3>
            {keys.map((k) => (
              <Field obj={C.text} f={{ key: k, literal: true, label: textLabel(k), type: isArea(k) ? 'i18n-area' : 'i18n' }} key={k} />
            ))}
          </div>
        )}
        {(sec.fields ?? []).map((f) => (
          <FieldBlock obj={C as unknown as Item} f={f} key={f.key} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHead title="Nội dung trang chủ" sub='Bật/tắt, sắp xếp các mục, thêm khối mới và sửa chữ, thẻ, danh sách. Nhớ bấm "Lưu thay đổi".' />
      <div className="split">
        <div className="panel panel--tight">
          <ol className="secs">
            <li className={current === 'hero' ? 'is-on' : ''}>
              <button type="button" className="secs__name" onClick={() => setSelected('hero')}>
                Đầu trang (Hero)
              </button>
              <span className="muted">cố định</span>
            </li>
            {order.map((s, i) => {
              const b = customOf(s.id);
              return (
                <li key={s.id} className={`${s.id === current ? 'is-on' : ''}${s.enabled === false ? ' is-off' : ''}${b ? ' is-custom' : ''}`}>
                  <label className="switch" title={s.enabled === false ? 'Đang ẩn' : 'Đang hiện'}>
                    <input
                      type="checkbox"
                      checked={s.enabled !== false}
                      onChange={(e) => {
                        s.enabled = e.currentTarget.checked;
                        change();
                      }}
                    />
                    <span />
                  </label>
                  <button type="button" className="secs__name" onClick={() => setSelected(s.id)}>
                    {labelOf(s.id)}
                    {b && <span className="secs__tag">{typeOf(b).label}</span>}
                  </button>
                  <span className="secs__move">
                    <button type="button" disabled={i === 0} title="Lên" onClick={() => swap(i, i - 1)}>
                      ↑
                    </button>
                    <button type="button" disabled={i === order.length - 1} title="Xuống" onClick={() => swap(i, i + 1)}>
                      ↓
                    </button>
                  </span>
                </li>
              );
            })}
            <li className="secs__add">
              <button type="button" className="btn btn--block" onClick={() => setAdding(true)}>
                + Thêm khối mới
              </button>
            </li>
          </ol>
        </div>
        {editor}
      </div>
      {adding && (
        <AddBlockDialog
          onClose={() => setAdding(false)}
          onAdded={(id) => {
            setAdding(false);
            setSelected(id);
          }}
        />
      )}
    </div>
  );
}
