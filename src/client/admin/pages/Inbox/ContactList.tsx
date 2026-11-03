import { api } from '../../lib/api.ts';
import { fmtTime } from '../../lib/path.ts';
import { useToast } from '../../ui/Toast.tsx';
import type { Contact } from '../../../../shared/types.ts';

/** Contact requests as expandable rows. `compact` (dashboard) hides the actions. */
export function ContactList({ items, compact = false, onChange }: { items: Contact[]; compact?: boolean; onChange?: () => void }) {
  const toast = useToast();
  return (
    <div className="inbox">
      {items.map((c) => (
        <details
          key={c.id}
          className={`msg${c.read ? '' : ' is-new'}`}
          onToggle={(e) => {
            const row = e.currentTarget;
            if (compact || c.read || !row.open) return;
            c.read = true; // opening marks it read
            api(`/contacts/${c.id}`, { method: 'PATCH', body: { read: true } }).then(() => {
              row.classList.remove('is-new');
              onChange?.();
            });
          }}
        >
          <summary>
            <span className="msg__dot" />
            <b>{c.name}</b>
            <span className="muted">{c.email}</span>
            <span className="msg__topic">{c.topic}</span>
            <time className="muted">{fmtTime(c.at)}</time>
          </summary>
          <div className="msg__body">
            <p className="msg__text">{c.message}</p>
            <p className="muted">{`Ngôn ngữ: ${c.lang} · IP: ${c.ip ?? '-'} · Đồng ý chính sách: ${c.consent ? 'có' : 'không'}`}</p>
            {!compact && (
              <div className="msg__actions">
                <a className="btn btn--sm" href={`mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent('Re: ' + (c.topic || 'Yêu cầu dự án'))}`}>
                  Trả lời qua email
                </a>
                <button type="button" className="btn btn--ghost btn--sm" onClick={async () => (await api(`/contacts/${c.id}`, { method: 'PATCH', body: { read: !c.read } }), onChange?.())}>
                  {c.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm danger"
                  onClick={async () => {
                    if (!confirm('Xoá yêu cầu này vĩnh viễn?')) return;
                    await api(`/contacts/${c.id}`, { method: 'DELETE' });
                    toast('Đã xoá.');
                    onChange?.();
                  }}
                >
                  Xoá
                </button>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
