/** One place that decides the public address of every item.
 *  Order: the item's own "Permalink" (any address you type) > parent page path (pages) > the content type's base name from Site settings > Permalinks. */
export const DEFAULT_BASES: Record<string, string> = { posts: "blog", services: "services", projects: "work", caseStudies: "case-studies" };
/** Current base names. Updated from settings each time they load (see lib/settings.ts). */
export const BASES: Record<string, string> = { ...DEFAULT_BASES };
/** Content types that can have their own address. */
export const ROUTABLE = ["pages", "posts", "projects", "services", "caseStudies"];
/** First segments the site itself uses; a custom permalink may not start with these. */
export const RESERVED_FIRST = ["admin", "api", "media", "_next", "og", "account", "checkout", "sitemap.xml", "robots.txt", "favicon.ico", "feed.xml"];

/** Lowercase letters, numbers, hyphens and single slashes. "" means "use the default". */
export function normalizePermalink(v: any): string {
  return String(v ?? "").trim().toLowerCase().replace(/^https?:\/\/[^/]+/, "").replace(/[?#].*$/, "")
    .replace(/[^a-z0-9\-_/\s]+/g, "").replace(/[\s_]+/g, "-").replace(/\/{2,}/g, "/").replace(/-{2,}/g, "-").replace(/^[/-]+|[/-]+$/g, "");
}

/** The address of an item, with a leading slash ("/" for the home page). */
export function entryUrl(collection: string, slug: string, data?: Record<string, any> | null): string {
  const custom = normalizePermalink(data?.permalink);
  if (custom) return "/" + custom;
  if (collection === "pages") { if (slug === "home") return "/"; const full = normalizePermalink(data?.fullPath); return "/" + (full || slug); }
  const base = BASES[collection];
  return base ? `/${base}/${slug}` : `/${slug}`;
}
/** The list page of a content type: /blog, /work ... */
export const listUrl = (collection: string) => `/${BASES[collection] || collection}`;
