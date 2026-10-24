/** Small in-memory cache for data that is read on every page view (settings, theme, content lists, menu state).
 *  A warm server answers from memory instead of asking the database again, which is what makes page changes feel instant.
 *  Entries expire after the TTL and are cleared at once whenever something is saved in the admin. */
const store = new Map<string, { at: number; v: Promise<any> }>();

export function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.v as Promise<T>;
  const v = fn();
  store.set(key, { at: Date.now(), v });
  v.catch(() => { if (store.get(key)?.v === v) store.delete(key); }); // never keep a failed lookup
  return v;
}
export const clearMemo = () => store.clear();
