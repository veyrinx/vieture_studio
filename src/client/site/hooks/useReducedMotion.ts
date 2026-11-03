import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

/** true when the visitor asked the OS for less motion (always false while rendering on the server). */
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
