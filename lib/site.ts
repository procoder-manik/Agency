import { cache } from "react";
import { getAllSettings } from "./settings";
import { getPublished } from "./content";
import { normPath } from "./menu";
import { BUILTIN_SLUGS } from "./blocks";
import { db, schema } from "./db";
import { and, eq, isNull } from "drizzle-orm";

export const FEATURE_PATHS: Record<string, string> = { pricing: "/pricing", blog: "/blog", caseStudies: "/case-studies", helpCenter: "/help" };

/** Paths hidden because their built-in page is unpublished or its feature flag is off. */
export const hiddenPaths = cache(async () => {
  const s = await getAllSettings();
  const hidden = new Set<string>();
  for (const [f, p] of Object.entries(FEATURE_PATHS)) if (!(s.features as any)[f]) hidden.add(p);
  try {
    const rows = await db().select({ slug: schema.entries.slug, status: schema.entries.status }).from(schema.entries)
      .where(and(eq(schema.entries.collection, "pages"), isNull(schema.entries.deletedAt)));
    for (const r of rows) if (r.status !== "published") hidden.add(r.slug === "home" ? "/" : "/" + r.slug);
  } catch {}
  return hidden;
});

export async function visibleNav() {
  const s = await getAllSettings();
  const hidden = await hiddenPaths();
  const ok = (href: string) => { const p = normPath(href, s.identity.domain).split("#")[0]; return !hidden.has(p) && ![...hidden].some((h) => h !== "/" && p.startsWith(h + "/")); };
  return {
    header: s.navigation.header.filter((l) => ok(l.href)),
    footer: s.navigation.footer.map((c) => ({ ...c, links: c.links.filter((l) => ok(l.href)) })).filter((c) => c.links.length),
  };
}

export async function featureOn(f: keyof Awaited<ReturnType<typeof getAllSettings>>["features"]) {
  return Boolean((await getAllSettings()).features[f]);
}

export const isBuiltinSlug = (s: string) => BUILTIN_SLUGS.includes(s);
export { getPublished };
