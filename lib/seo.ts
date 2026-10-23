import type { Metadata } from "next";
import { brandTemplate, getAllSettings, siteUrl, type Settings } from "./settings";
import { truncate, stripMd } from "./util";

export interface SeoFields {
  focusKeyword?: string; keywords?: string[] | string; metaTitle?: string; metaDescription?: string;
  ogTitle?: string; ogDescription?: string; ogImage?: string; twitterCard?: string; canonical?: string;
  noindex?: boolean; nofollow?: boolean; noarchive?: boolean; nosnippet?: boolean; excludeFromSitemap?: boolean;
  breadcrumbTitle?: string; schemaType?: string; schemaData?: Record<string, any>;
}

export const abs = (base: string, p?: string) => (!p ? base : /^https?:\/\//.test(p) ? p : base + (p.startsWith("/") ? p : "/" + p));

export function ogFallback(title: string, kind: string, label: string) {
  return `/api/og?title=${encodeURIComponent(truncate(title, 110))}&label=${encodeURIComponent(label)}&kind=${kind}`;
}

export interface MetaInput { title: string; description?: string; path: string; seo?: SeoFields; image?: string; ogLabel?: string; kind?: "page" | "post" | "case"; type?: "website" | "article"; publishedAt?: Date | null; isHome?: boolean }

/** Shared metadata builder: every public route calls this so SEO behaves the same everywhere. */
export async function buildMetadata(m: MetaInput): Promise<Metadata> {
  const s = await getAllSettings();
  const base = siteUrl(s.identity);
  const seo = m.seo || {};
  const name = s.identity.name;
  const raw = seo.metaTitle || m.title;
  const title = m.isHome && !seo.metaTitle ? `${name} | ${s.identity.tagline}` : brandTemplate(s.seo.titleTemplate, name).replace("%s", raw);
  const description = truncate(seo.metaDescription || m.description || s.seo.defaultDescription || s.identity.description, 170);
  const canonical = seo.canonical ? abs(base, seo.canonical) : abs(base, m.path);
  const img = abs(base, seo.ogImage || m.image || s.seo.ogImage || ogFallback(raw, m.kind || "page", m.ogLabel || "Page"));
  const kw = Array.isArray(seo.keywords) ? seo.keywords : (seo.keywords || "").split(",").map((k) => k.trim()).filter(Boolean);
  return {
    metadataBase: new URL(base),
    title: { absolute: title },
    description,
    keywords: [seo.focusKeyword, ...kw].filter(Boolean) as string[],
    alternates: { canonical },
    robots: { index: !seo.noindex, follow: !seo.nofollow, noarchive: !!seo.noarchive, nosnippet: !!seo.nosnippet },
    openGraph: {
      title: seo.ogTitle || raw, description: seo.ogDescription || description, url: canonical, siteName: name,
      type: m.type || "website", images: [{ url: img, width: 1200, height: 630, alt: seo.ogTitle || raw }],
      ...(m.publishedAt ? { publishedTime: new Date(m.publishedAt).toISOString() } : {}),
    },
    twitter: { card: (seo.twitterCard || s.seo.twitterCard || "summary_large_image") as any, title: seo.ogTitle || raw, description: seo.ogDescription || description, images: [img], ...(s.seo.twitterHandle ? { site: s.seo.twitterHandle } : {}) },
  };
}

export { SCHEMA_TYPES } from "./fields";

export interface SchemaInput {
  type: string; title: string; description?: string; path: string; image?: string;
  crumbs?: { name: string; path: string }[]; faqs?: { q: string; a: string }[]; steps?: { title: string; text?: string }[];
  offers?: { name: string; price: number; currency: string }[]; datePublished?: Date | null; dateModified?: Date | null; author?: string | string[];
  extra?: Record<string, any>;
}

export function organizationSchema(s: Settings) {
  const base = siteUrl(s.identity);
  const id = s.identity;
  const sameAs = Object.values(id.socials || {}).filter(Boolean);
  const org: any = {
    "@type": s.seo.localBusiness ? "LocalBusiness" : "Organization", "@id": base + "/#organization",
    name: id.name, url: base, description: id.description,
    logo: id.logo ? abs(base, id.logo) : abs(base, "/api/logo"),
    ...(id.legalName ? { legalName: id.legalName } : {}), ...(id.email ? { email: id.email } : {}), ...(id.phone ? { telephone: id.phone } : {}),
    ...(id.address ? { address: { "@type": "PostalAddress", streetAddress: id.address } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  if (s.seo.localBusiness && id.hours) org.openingHours = id.hours;
  return org;
}

/** Builds ONE combined JSON-LD @graph (organization, website, page type, breadcrumbs, FAQ, etc.).
 *  Only uses data that is on the page: no invented ratings, prices or dates. */
export async function buildJsonLd(i: SchemaInput) {
  const s = await getAllSettings();
  const base = siteUrl(s.identity);
  const url = abs(base, i.path);
  const graph: any[] = [organizationSchema(s), { "@type": "WebSite", "@id": base + "/#website", url: base, name: s.identity.name, publisher: { "@id": base + "/#organization" } }];
  const img = i.image ? abs(base, i.image) : undefined;
  const desc = i.description ? truncate(stripMd(i.description), 300) : undefined;
  const t = i.type;
  const node: any = { "@id": url + "#main", url, name: i.title, ...(desc ? { description: desc } : {}), ...(img ? { image: img } : {}) };
  if (["Article", "BlogPosting"].includes(t)) {
    Object.assign(node, { "@type": t, headline: truncate(i.title, 110), publisher: { "@id": base + "/#organization" }, mainEntityOfPage: url,
      ...(i.datePublished ? { datePublished: new Date(i.datePublished).toISOString() } : {}),
      ...(i.dateModified ? { dateModified: new Date(i.dateModified).toISOString() } : {}),
      author: Array.isArray(i.author) ? (i.author.length ? i.author.map((n) => ({ "@type": "Person", name: n })) : { "@id": base + "/#organization" }) : i.author ? { "@type": "Person", name: i.author } : { "@id": base + "/#organization" } });
  } else if (t === "Service" || t === "Product") {
    Object.assign(node, { "@type": t, ...(t === "Service" ? { provider: { "@id": base + "/#organization" }, serviceType: i.title } : { brand: { "@id": base + "/#organization" } }) });
    const offers = (i.offers || []).filter((o) => o.price > 0);
    if (offers.length) node.offers = offers.map((o) => ({ "@type": "Offer", name: o.name, price: String(o.price), priceCurrency: o.currency, url }));
  } else if (t === "HowTo" && i.steps?.length) {
    Object.assign(node, { "@type": "HowTo", step: i.steps.map((st, n) => ({ "@type": "HowToStep", position: n + 1, name: st.title, text: st.text || st.title })) });
  } else if (t === "CreativeWork") {
    Object.assign(node, { "@type": "CreativeWork", creator: { "@id": base + "/#organization" } });
  } else {
    Object.assign(node, { "@type": ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "FAQPage"].includes(t) ? t : "WebPage", isPartOf: { "@id": base + "/#website" } });
  }
  if (i.extra) Object.assign(node, i.extra);
  graph.push(node);
  if (i.faqs?.length) {
    const faq = { "@type": "FAQPage", ...(t === "FAQPage" ? {} : {}), mainEntity: i.faqs.filter((f) => f.q && f.a).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: stripMd(f.a) } })) };
    if (t === "FAQPage") Object.assign(node, { mainEntity: faq.mainEntity }); else if (faq.mainEntity.length) graph.push({ ...faq, "@id": url + "#faq" });
  }
  if (i.crumbs?.length) {
    graph.push({ "@type": "BreadcrumbList", "@id": url + "#breadcrumbs", itemListElement: [{ name: "Home", path: "/" }, ...i.crumbs].map((c, n) => ({ "@type": "ListItem", position: n + 1, name: c.name, item: abs(base, c.path) })) });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
