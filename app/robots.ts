import type { MetadataRoute } from "next";
import { getAllSettings, siteUrl } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrl((await getAllSettings()).identity);
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }], sitemap: `${base}/sitemap.xml`, host: base };
}
