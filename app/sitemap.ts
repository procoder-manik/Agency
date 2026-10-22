import type { MetadataRoute } from "next";
import { getAllSettings, siteUrl } from "@/lib/settings";
import { getPublished } from "@/lib/content";
import { getCollection } from "@/lib/collections";
import { hiddenPaths } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getAllSettings();
  const base = siteUrl(s.identity);
  const hidden = await hiddenPaths();
  const out: MetadataRoute.Sitemap = [];
  for (const key of ["pages", "services", "projects", "caseStudies", "posts"]) {
    const col = getCollection(key)!;
    for (const e of await getPublished(key)) {
      if (e.seo?.noindex || e.seo?.excludeFromSitemap) continue;
      const path = col.publicPath!(e.slug);
      if (hidden.has(path) || [...hidden].some((h) => h !== "/" && path.startsWith(h + "/"))) continue;
      out.push({ url: base + (path === "/" ? "" : path), lastModified: e.updatedAt, changeFrequency: key === "posts" ? "monthly" : "weekly", priority: path === "/" ? 1 : key === "pages" ? 0.8 : 0.6 });
    }
  }
  return out;
}
