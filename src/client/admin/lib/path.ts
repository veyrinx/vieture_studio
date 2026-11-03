import type { Item } from '../schema.ts';

export const getPath = (obj: Item, path: string): any => path.split('.').reduce<any>((o, k) => (o == null ? undefined : o[k]), obj);

export function setPath(obj: Item, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;
  const target = keys.reduce<Item>((o, k) => (o[k] ??= {}), obj);
  target[last] = value;
}

/** Display value of a {vi, en} pair (Vietnamese first). */
export const L = (pair: unknown): string =>
  pair && typeof pair === 'object' ? String((pair as Item).vi || (pair as Item).en || '') : String(pair ?? '');

export const fmtTime = (iso: string) => new Date(iso).toLocaleString('vi-VN');

// Stable React keys for items in editable lists (they get reordered, so the index won't do).
const ids = new WeakMap<object, number>();
let next = 0;
export const keyOf = (o: object) => {
  if (!ids.has(o)) ids.set(o, ++next);
  return ids.get(o)!;
};
