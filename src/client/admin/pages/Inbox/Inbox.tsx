import { useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { useLoad } from '../../ui/useLoad.ts';
import { PageError } from '../../ui/PageError.tsx';
import { ContactList } from './ContactList.tsx';
import type { Contact } from '../../../../shared/types.ts';

export function Inbox() {
  const { setBadges } = useAdmin();
  const { data, error, reload } = useLoad(() => api<{ items: Contact[] }>('/contacts'));
  const unread = data?.items.filter((c) => !c.read).length ?? 0;
  useEffect(() => {
    if (data) setBadges({ unread });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, unread]);
  if (error) return <PageError message={error} />;
  if (!data) return null;
  return (
    <div>
      <PageHead title="Hộp thư liên hệ" sub={`${data.items.length} yêu cầu · ${unread} chưa đọc`}>
        <a className="btn btn--ghost btn--sm" href="/api/admin/contacts.csv">
          Xuất CSV (Excel)
        </a>
      </PageHead>
      {data.items.length ? (
        <ContactList items={data.items} onChange={reload} />
      ) : (
        <div className="panel">
          <p className="muted">Chưa có yêu cầu nào.</p>
        </div>
      )}
    </div>
  );
}
