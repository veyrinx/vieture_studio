import { useEffect, useState } from 'react';
import { api, errMsg } from '../../lib/api.ts';
import { useToast } from '../../ui/Toast.tsx';
import { fmtTime } from '../../lib/path.ts';
import { useAdmin, type PageId } from '../../state/AdminContext.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { PageError } from '../../ui/PageError.tsx';
import { useLoad } from '../../ui/useLoad.ts';
import { ContactList } from '../Inbox/ContactList.tsx';
import type { Contact } from '../../../../shared/types.ts';

interface Stats {
  contacts: { total: number; unread: number };
  applications: { total: number; new: number };
  recent: Contact[];
  content: { rev: number; updatedAt: string; updatedBy: string };
  notify: { telegram: boolean; email: boolean };
}

/** Where alerts for new requests go, with a test button. */
function NotifyPanel({ state }: { state: Stats['notify'] }) {
  const { user } = useAdmin();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const row = (on: boolean, label: string, off: string) => (
    <li>
      <span className={`pill${on ? '' : ' pill--off'}`}>{on ? 'Đang bật' : 'Chưa bật'}</span> <b>{label}</b>
      {!on && <span className="muted"> — {off}</span>}
    </li>
  );
  return (
    <section className="panel">
      <h2>Thông báo khi có yêu cầu / hồ sơ mới</h2>
      <ul className="help">
        {row(state.telegram, 'Telegram', 'thêm TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID vào file .env trên server (xem .env.example).')}
        {row(state.email, 'Email', 'thêm SMTP_HOST / SMTP_USER / SMTP_PASS (Gmail: dùng App password) vào file .env trên server.')}
      </ul>
      {state.telegram && user.role === 'admin' && (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={sending}
          onClick={async () => {
            setSending(true);
            try {
              await api('/notify-test', { method: 'POST' });
              toast('Đã gửi tin nhắn thử tới Telegram.');
            } catch (e) {
              toast(errMsg(e));
            } finally {
              setSending(false);
            }
          }}
        >
          Gửi thông báo thử
        </button>
      )}
      {!state.telegram && !state.email && <p className="muted">Hiện yêu cầu và hồ sơ mới chỉ được lưu trong trang quản trị — hãy kiểm tra thường xuyên.</p>}
    </section>
  );
}

export function Dashboard() {
  const { user, draft, go, setBadges } = useAdmin();
  const { data: s, error } = useLoad(() => api<Stats>('/stats'));
  useEffect(() => {
    if (s) setBadges({ unread: s.contacts.unread, newApps: s.applications?.new ?? 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);
  if (error) return <PageError message={error} />;
  if (!s) return null;
  const card = (label: string, value: string | number, sub: string, page: PageId) => (
    <button type="button" className="stat" onClick={() => go(page)}>
      <span className="muted">{label}</span>
      <b>{value}</b>
      <span className="muted">{sub}</span>
    </button>
  );
  return (
    <div>
      <PageHead title={`Xin chào, ${user.username}`} sub="Tổng quan website VieTure Studio">
        <a className="btn btn--ghost btn--sm" href="/" target="_blank" rel="noopener">
          Xem trang web ↗
        </a>
      </PageHead>
      <div className="stats">
        {card('Yêu cầu chưa đọc', s.contacts.unread, `trên tổng ${s.contacts.total}`, 'inbox')}
        {card('Hồ sơ ứng tuyển mới', s.applications?.new ?? 0, `trên tổng ${s.applications?.total ?? 0}`, 'applications')}
        {card('Phiên bản nội dung', `#${s.content.rev}`, `${fmtTime(s.content.updatedAt)} · ${s.content.updatedBy}`, 'history')}
        {card('Mục trên trang chủ', draft.sections.filter((x) => x.enabled !== false).length, `đang bật / ${draft.sections.length}`, 'content')}
        {card('Lĩnh vực', draft.services.length, 'đang hiển thị', 'content')}
      </div>
      {s.notify && <NotifyPanel state={s.notify} />}
      <section className="panel">
        <h2>Yêu cầu liên hệ mới nhất</h2>
        {s.recent.length ? <ContactList items={s.recent} compact /> : <p className="muted">Chưa có yêu cầu nào.</p>}
      </section>
      <section className="panel">
        <h2>Cách định dạng chữ</h2>
        <ul className="help">
          <li>
            <code>[chữ]</code> → chữ màu gradient của thương hiệu
          </li>
          <li>
            <code>**chữ**</code> → in đậm
          </li>
          <li>
            <code>[chữ](https://...)</code> → đường link
          </li>
          <li>Xuống dòng trong ô nhiều dòng → xuống dòng trên trang</li>
        </ul>
      </section>
    </div>
  );
}
