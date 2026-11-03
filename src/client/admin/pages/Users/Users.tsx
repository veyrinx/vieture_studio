import { useState, type FormEvent } from 'react';
import { api, errMsg } from '../../lib/api.ts';
import { fmtTime } from '../../lib/path.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { Dialog } from '../../ui/Dialog.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { PageError } from '../../ui/PageError.tsx';
import { useLoad } from '../../ui/useLoad.ts';
import type { PublicUser } from '../../../../shared/types.ts';

function SecretDialog({ title, username, password, onClose }: { title: string; username: string; password: string; onClose: () => void }) {
  const toast = useToast();
  return (
    <Dialog onClose={onClose}>
      <h2>{title}</h2>
      <p>
        Gửi thông tin này cho người dùng qua kênh an toàn. Mật khẩu sẽ <b>không hiển thị lại</b>.
      </p>
      <div className="secret">
        <div>
          <span className="muted">Tên đăng nhập</span>
          <code>{username}</code>
        </div>
        <div>
          <span className="muted">Mật khẩu</span>
          <code>{password}</code>
        </div>
      </div>
      <div className="dialog__btns">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigator.clipboard?.writeText(`${username} / ${password}`).then(() => toast('Đã chép.'))}>
          Chép
        </button>
        <button type="button" className="btn btn--sm" onClick={onClose}>
          Đã lưu lại
        </button>
      </div>
    </Dialog>
  );
}

export function Users() {
  const { user: me } = useAdmin();
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ items: PublicUser[] }>('/users'));
  const [secret, setSecret] = useState<{ title: string; username: string; password: string } | null>(null);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const r = await api<{ user: PublicUser; password: string }>('/users', { method: 'POST', body: { username: fd.get('username'), role: fd.get('role') } });
      setSecret({ title: 'Đã tạo người dùng', username: r.user.username, password: r.password });
      reload();
    } catch (err) {
      toast(errMsg(err), 'err');
    }
  }

  if (error) return <PageError message={error} />;
  if (!data) return null;
  return (
    <div>
      <PageHead title="Người dùng" sub="Quản trị viên: toàn quyền. Biên tập viên: sửa nội dung, xem hộp thư, không quản lý người dùng." />
      <div className="panel">
        <form className="inline-form" onSubmit={create}>
          <input name="username" placeholder="tên đăng nhập (a-z, 0-9)" required pattern="[a-zA-Z0-9._-]{3,32}" />
          <select name="role">
            <option value="editor">Biên tập viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <button className="btn btn--sm" type="submit">
            + Thêm người dùng
          </button>
        </form>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Quyền</th>
              <th>Đăng nhập gần nhất</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={`${u.username}-${u.role}`}>
                <td>
                  <b>{u.username}</b>
                  {u.username === me.username && <span className="pill">bạn</span>}
                </td>
                <td>
                  <select
                    defaultValue={u.role}
                    onChange={async (e) => {
                      try {
                        await api(`/users/${u.username}`, { method: 'PATCH', body: { role: e.currentTarget.value } });
                        toast('Đã đổi quyền.');
                      } catch (err) {
                        toast(errMsg(err), 'err');
                      }
                      reload();
                    }}
                  >
                    <option value="admin">Quản trị viên</option>
                    <option value="editor">Biên tập viên</option>
                  </select>
                </td>
                <td className="muted">{u.lastLoginAt ? fmtTime(u.lastLoginAt) : 'chưa'}</td>
                <td className="row-actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={async () => {
                      if (!confirm(`Đặt lại mật khẩu cho "${u.username}"? Người này sẽ bị đăng xuất.`)) return;
                      const r = await api<{ password: string }>(`/users/${u.username}`, { method: 'PATCH', body: { resetPassword: true } });
                      setSecret({ title: 'Mật khẩu mới', username: u.username, password: r.password });
                    }}
                  >
                    Đặt lại mật khẩu
                  </button>
                  {u.username !== me.username && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm danger"
                      onClick={async () => {
                        if (!confirm(`Xoá người dùng "${u.username}"?`)) return;
                        try {
                          await api(`/users/${u.username}`, { method: 'DELETE' });
                          toast('Đã xoá.');
                        } catch (err) {
                          toast(errMsg(err), 'err');
                        }
                        reload();
                      }}
                    >
                      Xoá
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {secret && <SecretDialog {...secret} onClose={() => setSecret(null)} />}
    </div>
  );
}
