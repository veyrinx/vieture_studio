// Global admin styles first; page folders add their own CSS after.
import './styles/admin.css';
import { useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './lib/api.ts';
import { ToastProvider } from './ui/Toast.tsx';
import { AdminProvider, useAdmin } from './state/AdminContext.tsx';
import { Shell } from './layout/Shell.tsx';
import { Login } from './pages/Login/Login.tsx';
import { Dashboard } from './pages/Dashboard/Dashboard.tsx';
import { Content } from './pages/Content/Content.tsx';
import { Links, PrivacyPage, Settings } from './pages/Edit/EditPages.tsx';
import { Inbox } from './pages/Inbox/Inbox.tsx';
import { Applications } from './pages/Applications/Applications.tsx';
import { BlogPosts } from './pages/Blog/BlogPosts.tsx';
import { Media } from './pages/Media/Media.tsx';
import { History } from './pages/History/History.tsx';
import { Users } from './pages/Users/Users.tsx';
import { Account } from './pages/Account/Account.tsx';
import type { PublicUser } from '../../shared/types.ts';

function Page() {
  const { page, user } = useAdmin();
  switch (page) {
    case 'content':
      return <Content />;
    case 'blog':
      return <BlogPosts />;
    case 'links':
      return <Links />;
    case 'settings':
      return <Settings />;
    case 'privacy':
      return <PrivacyPage />;
    case 'inbox':
      return <Inbox />;
    case 'applications':
      return <Applications />;
    case 'media':
      return <Media />;
    case 'history':
      return <History />;
    case 'users':
      return user.role === 'admin' ? <Users /> : <p>Không có quyền.</p>;
    case 'account':
      return <Account />;
    default:
      return <Dashboard />;
  }
}

export function App() {
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined);
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api<{ user: PublicUser }>('/me').then(
      (r) => setUser(r.user),
      () => setUser(null)
    );
  }, []);
  return (
    <ToastProvider>
      {user === undefined ? (
        <p className="boot">Đang tải…</p>
      ) : user === null ? (
        <Login onLogin={setUser} />
      ) : (
        <AdminProvider user={user} onLogout={() => setUser(null)} key={user.username}>
          <Shell>
            <Page />
          </Shell>
        </AdminProvider>
      )}
    </ToastProvider>
  );
}
