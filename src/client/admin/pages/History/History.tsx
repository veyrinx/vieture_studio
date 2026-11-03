import { api } from '../../lib/api.ts';
import { fmtTime } from '../../lib/path.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { PageError } from '../../ui/PageError.tsx';
import { useLoad } from '../../ui/useLoad.ts';

interface Version {
  id: string;
  rev: number;
  updatedAt: string;
  updatedBy: string;
}

export function History() {
  const { rev, reloadContent } = useAdmin();
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ items: Version[] }>('/history'), [rev]);
  if (error) return <PageError message={error} />;
  if (!data) return null;
  return (
    <div>
      <PageHead title="Lịch sử thay đổi" sub={`Bản hiện tại: #${rev}. Hệ thống giữ ${data.items.length} bản trước gần nhất (tối đa 30).`} />
      <div className="panel">
        {data.items.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Bản</th>
                <th>Thời gian</th>
                <th>Người lưu</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((v) => (
                <tr key={v.id}>
                  <td>#{v.rev}</td>
                  <td>{fmtTime(v.updatedAt)}</td>
                  <td>{v.updatedBy}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={async () => {
                        if (!confirm(`Khôi phục trang web về bản #${v.rev}? Bản hiện tại vẫn được lưu trong lịch sử.`)) return;
                        await api(`/history/${encodeURIComponent(v.id)}/restore`, { method: 'POST' });
                        await reloadContent();
                        toast(`Đã khôi phục bản #${v.rev}.`);
                        reload();
                      }}
                    >
                      Khôi phục
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">Chưa có bản cũ nào — lịch sử bắt đầu từ lần lưu đầu tiên.</p>
        )}
      </div>
    </div>
  );
}
