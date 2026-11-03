import { api, errMsg, uploadFile } from '../../lib/api.ts';
import { useToast } from '../../ui/Toast.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { PageError } from '../../ui/PageError.tsx';
import { useLoad } from '../../ui/useLoad.ts';

interface Upload {
  url: string;
  name: string;
  size: number;
}

export function Media() {
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ items: Upload[] }>('/uploads'));
  if (error) return <PageError message={error} />;
  if (!data) return null;
  return (
    <div>
      <PageHead title="Thư viện ảnh" sub="PNG, JPG, WebP, GIF — ảnh chụp được tự thu nhỏ (tối đa 1920px) và nén sang WebP khi tải lên. Dùng ảnh cho dự án, blog.">
        <label className="btn btn--sm">
          + Tải ảnh lên
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            hidden
            onChange={async (e) => {
              for (const f of e.currentTarget.files ?? []) {
                try {
                  await uploadFile(f);
                } catch (err) {
                  toast(`${f.name}: ${errMsg(err)}`, 'err');
                }
              }
              toast('Đã tải ảnh lên.');
              reload();
            }}
          />
        </label>
      </PageHead>
      {data.items.length ? (
        <div className="media">
          {data.items.map((m) => (
            <figure key={m.name}>
              <img src={m.url} alt={m.name} loading="lazy" />
              <figcaption>
                <code>{m.url}</code>
                <span className="muted">{Math.round(m.size / 1024)} KB</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigator.clipboard?.writeText(m.url).then(() => toast('Đã chép đường dẫn.'))}>
                  Chép link
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm danger"
                  onClick={async () => {
                    if (!confirm('Xoá ảnh này? Các mục đang dùng ảnh sẽ bị mất ảnh.')) return;
                    await api(`/uploads/${m.name}`, { method: 'DELETE' });
                    reload();
                  }}
                >
                  Xoá
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="panel">
          <p className="muted">Chưa có ảnh nào.</p>
        </div>
      )}
    </div>
  );
}
