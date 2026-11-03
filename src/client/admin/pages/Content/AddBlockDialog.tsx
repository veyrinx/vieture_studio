import { useAdmin } from '../../state/AdminContext.tsx';
import { Dialog } from '../../ui/Dialog.tsx';
import { Svg } from '../../ui/Icon.tsx';
import { CUSTOM_TYPES } from '../../schema.ts';
import type { CustomBlock } from '../../../../shared/types.ts';

/** "+ Thêm khối mới": pick a block type, insert it above the contact section. */
export function AddBlockDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (id: string) => void }) {
  const { draft: C, change } = useAdmin();
  return (
    <Dialog className="dialog dialog--wide" onClose={onClose}>
      <h2>Thêm khối mới vào trang chủ</h2>
      <p className="muted">Chọn kiểu khối. Khối mới được đặt ngay trên mục Liên hệ — bạn có thể kéo lên/xuống sau.</p>
      <div className="typepick">
        {CUSTOM_TYPES.map((t) => (
          <button
            type="button"
            className="typepick__opt"
            key={t.type}
            onClick={() => {
              const id = `khoi-${Date.now().toString(36)}`;
              C.custom.push({ id, type: t.type, ...t.template() } as CustomBlock);
              const at = C.sections.findIndex((s) => s.id === 'contact');
              C.sections.splice(at === -1 ? C.sections.length : at, 0, { id, enabled: true, custom: true });
              change();
              onAdded(id);
            }}
          >
            <span className="typepick__icon">
              <Svg name={t.icon} />
            </span>
            <b>{t.label}</b>
            <span className="muted">{t.desc}</span>
          </button>
        ))}
      </div>
      <div className="dialog__btns">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
          Huỷ
        </button>
      </div>
    </Dialog>
  );
}
