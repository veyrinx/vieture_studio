import { useState, type FormEvent } from 'react';
import { api, errMsg } from '../../lib/api.ts';
import type { PublicUser } from '../../../../shared/types.ts';

export function Login({ onLogin }: { onLogin: (u: PublicUser) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const r = await api<{ user: PublicUser }>('/login', { method: 'POST', body: { username: fd.get('username'), password: fd.get('password') } });
      onLogin(r.user);
    } catch (ex) {
      setError(errMsg(ex));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-wrap">
      <form className="login" onSubmit={submit}>
        <img src="/brand/icon-192.png" alt="" width={64} height={64} />
        <h1>VieTure Admin</h1>
        <p className="muted">Đăng nhập để quản lý website</p>
        <label className="f">
          <div className="f__label">Tên đăng nhập</div>
          <input name="username" autoComplete="username" required autoFocus />
        </label>
        <label className="f">
          <div className="f__label">Mật khẩu</div>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <p className="login__err" role="alert">
          {error}
        </p>
        <button className="btn btn--block" type="submit" disabled={busy}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
