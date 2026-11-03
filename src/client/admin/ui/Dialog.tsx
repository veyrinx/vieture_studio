import { useEffect, useRef, type ReactNode } from 'react';

/** Native modal <dialog>, open while mounted. */
export function Dialog({ className = 'dialog', onClose, children }: { className?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog className={className} ref={ref} onClose={onClose}>
      {children}
    </dialog>
  );
}
