import type { ReactNode } from 'react';
import { EDIT_PAGES, NAV, useAdmin } from '../state/AdminContext.tsx';
import { Icon } from '../ui/Icon.tsx';
import { fmtTime } from '../lib/path.ts';

function SaveBar() {
  const { dirty, saving, save, discard, rev, meta } = useAdmin();
  return (
    <div className={`savebar${dirty ? ' is-dirty' : ''}`}>
      {dirty ? (
        <span>● Có thay đổi chưa lưu</span>
      ) : (
        <span className="muted">{meta.updatedAt ? `Đã lưu · bản #${rev} · ${fmtTime(meta.updatedAt)} · ${meta.updatedBy}` : ''}</span>
      )}
      <div className="savebar__btns">
        {dirty && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={discard}>
            Huỷ thay đổi
          </button>
        )}
        <button type="button" className="btn btn--sm" disabled={!dirty || saving} onClick={save}>
          {saving ? 'Đang lưu…' : 'Lưu thay đổi  (Ctrl+S)'}
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { user, page, go, logout, badges } = useAdmin();
  return (
    <div className="layout">
      <aside className="side">
        <a className="side__brand" href="/" target="_blank" rel="noopener">
          <img src="/brand/icon-96.png" alt="" width={34} height={34} />
          <span>
            <b>VieTure</b> Admin
          </span>
        </a>
        <nav>
          {NAV.filter((n) => !n.admin || user.role === 'admin').map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={page === n.id ? 'is-on' : ''}
              onClick={(e) => {
                e.preventDefault();
                go(n.id);
              }}
            >
              <Icon name={n.icon} />
              {n.label}
              {n.id === 'inbox' && badges.unread > 0 && <span className="badge">{badges.unread}</span>}
              {n.id === 'applications' && badges.newApps > 0 && <span className="badge">{badges.newApps}</span>}
            </a>
          ))}
        </nav>
        <div className="side__user">
          <div>
            <b>{user.username}</b>
            <span className="muted">{user.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên'}</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main">
        {EDIT_PAGES.has(page) && <SaveBar />}
        <div className="main__inner">{children}</div>
      </main>
    </div>
  );
}
