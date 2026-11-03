import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { api, errMsg } from '../lib/api.ts';
import { useToast } from '../ui/Toast.tsx';
import type { PublicUser, SiteContent } from '../../../shared/types.ts';

export type PageId =
  | 'dashboard' | 'content' | 'blog' | 'links' | 'settings' | 'privacy' | 'inbox' | 'applications' | 'media' | 'history' | 'users' | 'account';

export const NAV: Array<{ id: PageId; label: string; icon: string; admin?: boolean }> = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'chart' },
  { id: 'content', label: 'Nội dung trang chủ', icon: 'layers' },
  { id: 'blog', label: 'Blog / Tin tức', icon: 'book' },
  { id: 'links', label: 'Menu & liên kết', icon: 'link' },
  { id: 'settings', label: 'Thông tin & SEO', icon: 'gear' },
  { id: 'privacy', label: 'Chính sách bảo mật', icon: 'shield-check' },
  { id: 'inbox', label: 'Hộp thư liên hệ', icon: 'mail' },
  { id: 'applications', label: 'Hồ sơ ứng tuyển', icon: 'briefcase' },
  { id: 'media', label: 'Thư viện ảnh', icon: 'monitor-code' },
  { id: 'history', label: 'Lịch sử thay đổi', icon: 'book' },
  { id: 'users', label: 'Người dùng', icon: 'users', admin: true },
  { id: 'account', label: 'Tài khoản của tôi', icon: 'lock' },
];
/** Pages that edit the site content draft (and show the save bar). */
export const EDIT_PAGES = new Set<PageId>(['content', 'links', 'settings', 'privacy']);
const isPage = (p: string): p is PageId => NAV.some((n) => n.id === p);

interface Admin {
  user: PublicUser;
  logout: () => void;
  /** Working copy of the site content. Editors change it in place, then call change(). */
  draft: SiteContent;
  change: () => void;
  dirty: boolean;
  saving: boolean;
  save: () => Promise<void>;
  discard: () => void;
  reloadContent: () => Promise<void>;
  rev: number;
  meta: { updatedAt: string; updatedBy: string };
  /** Bumped whenever the draft is replaced (load, discard, restore) so editors re-read it. */
  epoch: number;
  page: PageId;
  go: (page: PageId) => void;
  /** A page with its own unsaved state (the post editor) registers it, so leaving asks first. */
  setLeaveGuard: (isDirty: (() => boolean) | null) => void;
  version: number;
  badges: { unread: number; newApps: number };
  setBadges: (b: Partial<{ unread: number; newApps: number }>) => void;
}

const AdminContext = createContext<Admin | null>(null);
export const useAdmin = () => {
  const a = useContext(AdminContext);
  if (!a) throw new Error('useAdmin outside AdminProvider');
  return a;
};

interface Loaded {
  content: SiteContent;
  rev: number;
  updatedAt: string;
  updatedBy: string;
}

export function AdminProvider({ user, onLogout, children }: { user: PublicUser; onLogout: () => void; children: ReactNode }) {
  const toast = useToast();
  const draft = useRef<SiteContent | null>(null);
  const saved = useRef('');
  const [rev, setRev] = useState(0);
  const [meta, setMeta] = useState({ updatedAt: '', updatedBy: '' });
  const [epoch, setEpoch] = useState(0);
  const [version, force] = useReducer((x: number) => x + 1, 0);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<PageId>(() => (isPage(location.hash.slice(1)) ? (location.hash.slice(1) as PageId) : 'dashboard'));
  const [badges, setBadgesState] = useState({ unread: 0, newApps: 0 });
  const leaveGuard = useRef<(() => boolean) | null>(null);

  const apply = (r: Loaded) => {
    draft.current = r.content;
    saved.current = JSON.stringify(r.content);
    setRev(r.rev);
    setMeta({ updatedAt: r.updatedAt, updatedBy: r.updatedBy });
    setEpoch((e) => e + 1);
  };
  const reloadContent = useCallback(async () => apply(await api<Loaded>('/content')), []);
  useEffect(() => {
    reloadContent().catch((e) => toast(errMsg(e), 'err'));
  }, [reloadContent, toast]);

  const dirty = !!draft.current && JSON.stringify(draft.current) !== saved.current;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const pageRef = useRef(page);
  pageRef.current = page;

  const save = useCallback(async () => {
    if (!dirtyRef.current || !draft.current) return;
    setSaving(true);
    try {
      const r = await api<{ rev: number; updatedAt: string }>('/content', { method: 'PUT', body: { content: draft.current, rev } });
      saved.current = JSON.stringify(draft.current);
      setRev(r.rev);
      setMeta({ updatedAt: r.updatedAt, updatedBy: user.username });
      toast('Đã lưu. Trang web đã được cập nhật.');
    } catch (e) {
      toast(errMsg(e), 'err');
    } finally {
      setSaving(false);
    }
  }, [rev, toast, user.username]);

  const discard = useCallback(() => {
    if (!confirm('Bỏ mọi thay đổi chưa lưu?')) return;
    draft.current = JSON.parse(saved.current);
    setEpoch((e) => e + 1);
  }, []);

  const go = useCallback((next: PageId) => {
    const from = pageRef.current;
    if (leaveGuard.current?.() && !confirm('Bài viết có thay đổi chưa lưu. Rời trang này?')) {
      history.replaceState(null, '', `#${from}`);
      return;
    }
    leaveGuard.current = null;
    if (EDIT_PAGES.has(from) && !EDIT_PAGES.has(next) && dirtyRef.current && !confirm('Bạn có thay đổi chưa lưu. Rời trang này?')) {
      history.replaceState(null, '', `#${from}`); // undo a back/forward hash change
      return;
    }
    if (!EDIT_PAGES.has(next) && dirtyRef.current) {
      draft.current = JSON.parse(saved.current);
      setEpoch((e) => e + 1);
    }
    setPage(next);
    if (location.hash !== `#${next}`) location.hash = next;
  }, []);

  // browser back/forward between pages
  useEffect(() => {
    const onHash = () => {
      const p = location.hash.slice(1);
      if (isPage(p) && p !== pageRef.current) go(p);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [go]);

  // Ctrl+S saves; warn before closing the tab with unsaved work
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    const unload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current || leaveGuard.current?.()) e.preventDefault();
    };
    window.addEventListener('keydown', key);
    window.addEventListener('beforeunload', unload);
    return () => (window.removeEventListener('keydown', key), window.removeEventListener('beforeunload', unload));
  }, [save]);

  const value = useMemo<Admin | null>(
    () =>
      draft.current && {
        user,
        logout: async () => {
          if (dirtyRef.current && !confirm('Bạn có thay đổi chưa lưu. Vẫn đăng xuất?')) return;
          await api('/logout', { method: 'POST' }).catch(() => {});
          onLogout();
        },
        draft: draft.current,
        change: force,
        dirty,
        saving,
        save,
        discard,
        reloadContent,
        rev,
        meta,
        epoch,
        page,
        go,
        setLeaveGuard: (g) => {
          leaveGuard.current = g;
        },
        version,
        badges,
        setBadges: (b) => setBadgesState((x) => ({ ...x, ...b })),
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, dirty, saving, save, discard, reloadContent, rev, meta, epoch, page, go, badges, draft.current, version]
  );

  if (!value) return <p className="boot">Đang tải…</p>;
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
