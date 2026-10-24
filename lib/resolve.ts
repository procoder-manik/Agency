import { cache } from "react";
import { getPublished, type Entry } from "./content";
import { ROUTABLE, entryUrl } from "./permalinks";

/** Every published, routable item keyed by its public address. Built from cached lists, so it is cheap. */
export const addressMap = cache(async () => {
  const map = new Map<string, { collection: string; entry: Entry }>();
  const lists = await Promise.all(ROUTABLE.map(async (c) => [c, await getPublished(c)] as const));
  for (const [collection, list] of lists) for (const entry of list) {
    if (collection === "pages" && (entry.slug === "home" || (entry.data as any)?.template)) continue;
    map.set(entryUrl(collection, entry.slug, entry.data as any), { collection, entry });
  }
  return map;
});

export async function resolveAddress(url: string) { return (await addressMap()).get(url.replace(/\/+$/, "") || "/") || null; }
