// One-shot "open this when you get there": another page sets it before navigating to the
// content editor, which then selects the section and expands the list item.
let pending: { section: string; item?: object } | null = null;

export const setFocus = (section: string, item?: object) => {
  pending = { section, item };
};

/** The section to select (read once, when the content editor mounts). */
export const takeSection = () => {
  const s = pending?.section ?? null;
  if (pending && !pending.item) pending = null;
  return s;
};

/** True for the list item to expand; clears the request. */
export const takeItem = (item: object) => {
  if (pending?.item !== item) return false;
  pending = null;
  return true;
};
