import { notFound, permanentRedirect, redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, sql as dsql } from "drizzle-orm";
import { db, schema } from "./db";
import { getPublished, getPublishedBySlug } from "./content";
import { buildJsonLd, buildMetadata } from "./seo";
import { hiddenPaths } from "./site";
import { faqItems } from "@/components/site/Blocks";
import type { Block } from "./blocks";
import { mediaUrl } from "./media";
import { entryUrl } from "./permalinks";

export function JsonLd({ data }: { data: any }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Redirect if a rule exists, otherwise log the 404 and show the not-found page. */
export async function handleMissing(path: string): Promise<never> {
  try {
    const [r] = await db().select().from(schema.redirects).where(eq(schema.redirects.fromPath, path.replace(/\/+$/, "") || "/")).limit(1);
    if (r) { if (r.type === 302) redirect(r.toPath); permanentRedirect(r.toPath); }
    if (/\.(ico|png|jpe?g|gif|svg|webp|avif|map|js|css|woff2?|ttf|txt|xml|php|env|json)$/i.test(path) || /^\/(wp-|\.well-known|_next|xmlrpc)/i.test(path)) notFound();
    const ref = headers().get("referer") || "";
    await db().insert(schema.notFoundLog).values({ path: path.slice(0, 500), referrer: ref.slice(0, 500) })
      .onConflictDoUpdate({ target: schema.notFoundLog.path, set: { hits: dsql`${schema.notFoundLog.hits} + 1`, lastSeen: new Date(), referrer: ref.slice(0, 500), updatedAt: new Date() } });
  } catch (e: any) { if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e; }
  notFound();
}

export async function loadPage(slug: string) {
  const page = await getPublishedBySlug("pages", slug);
  if (!page || page.data?.template) return null;
  const hidden = await hiddenPaths();
  if (hidden.has(slug === "home" ? "/" : `/${slug}`) || hidden.has(entryUrl("pages", page.slug, page.data))) return null;
  return page;
}

export async function pageMetadata(slug: string) {
  const page = await loadPage(slug);
  if (!page) return {};
  const hero = (page.data.blocks as Block[] | undefined)?.find((b) => b.type === "hero" && !b.hidden);
  return buildMetadata({ title: page.title, description: hero?.data?.subheading, path: entryUrl("pages", page.slug, page.data), seo: page.seo, image: mediaUrl(page.data.cover), ogLabel: "Page", isHome: slug === "home" });
}

export async function pageSchema(slug: string, page: NonNullable<Awaited<ReturnType<typeof loadPage>>>) {
  const blocks = ((page.data.blocks || []) as Block[]).filter((b) => !b.hidden);
  const faqs = (await Promise.all(blocks.filter((b) => b.type === "faq").map((b) => faqItems(b.data || {})))).flat();
  const hero = blocks.find((b) => b.type === "hero");
  const steps = blocks.find((b) => b.type === "steps")?.data?.items || [];
  let type = page.seo?.schemaType && page.seo.schemaType !== "auto" ? page.seo.schemaType : "WebPage";
  if (type === "FAQPage" && !faqs.length) type = "WebPage";
  const path = entryUrl("pages", page.slug, page.data);
  // breadcrumbs follow the parent pages, so a child landing page reads Home > Service area > New Jersey
  const trail: { name: string; path: string }[] = [];
  const allPages = (page.data as any).parent ? await getPublished("pages") : [];
  for (let cur: any = page, i = 0; cur && i < 8; i++) { trail.unshift({ name: cur.seo?.breadcrumbTitle || cur.title, path: entryUrl("pages", cur.slug, cur.data) }); cur = cur.data?.parent ? allPages.find((x: any) => x.id === Number(cur.data.parent)) : null; }
  const loc = (page.data as any)?.location as { label?: string; city?: string; service?: string } | undefined;
  return buildJsonLd({
    type, title: page.seo?.metaTitle || page.title, description: page.seo?.metaDescription || hero?.data?.subheading, path, image: mediaUrl(page.data.cover) || undefined,
    faqs, steps, crumbs: slug === "home" ? [] : trail, dateModified: page.updatedAt,
    ...(loc ? { extra: { areaServed: { "@type": "AdministrativeArea", name: loc.label || loc.city }, serviceType: loc.service || page.title } } : {}),
  });
}
