import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Kind = 'ok' | 'err';
const ToastContext = createContext<(msg: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Array<{ id: number; msg: string; kind: Kind; shown: boolean }>>([]);
  const toast = useCallback((msg: string, kind: Kind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, msg, kind, shown: false }]);
    setTimeout(() => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, shown: true } : x))), 10);
    setTimeout(() => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, shown: false } : x))), 3200);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}${t.shown ? ' is-in' : ''}`} role="status">
          {t.msg}
        </div>
      ))}
    </ToastContext.Provider>
  );
}
