import type { FormEvent } from 'react';
import { api, errMsg } from '../../lib/api.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { PageHead } from '../../ui/PageHead.tsx';

export function Account() {
  const { user } = useAdmin();
  const toast = useToast();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('next') !== fd.get('confirm')) return toast('Mật khẩu nhập lại không khớp.', 'err');
    try {
      await api('/me/password', { method: 'POST', body: { current: fd.get('current'), next: fd.get('next') } });
      form.reset();
      toast('Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.');
    } catch (err) {
      toast(errMsg(err), 'err');
    }
  }
  return (
    <div>
      <PageHead title="Tài khoản của tôi" sub={`${user.username} · ${user.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên'}`} />
      <form className="panel narrow" onSubmit={submit}>
        <h2>Đổi mật khẩu</h2>
        <label className="f">
          <div className="f__label">Mật khẩu hiện tại</div>
          <input name="current" type="password" autoComplete="current-password" required />
        </label>
        <label className="f">
          <div className="f__label">Mật khẩu mới (ít nhất 10 ký tự)</div>
          <input name="next" type="password" autoComplete="new-password" minLength={10} required />
        </label>
        <label className="f">
          <div className="f__label">Nhập lại mật khẩu mới</div>
          <input name="confirm" type="password" autoComplete="new-password" minLength={10} required />
        </label>
        <button className="btn" type="submit">
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}
