import type postgres from "postgres";
import { newBlock } from "./blocks";
import { slugify } from "./util";
import { buildLocationPage, DEFAULT_PATTERNS } from "./templating";
import { IDENTITY, NAVIGATION, SERVICES, PACKAGES, CATEGORIES, FAQS, PACK_VERSION } from "./content-pack/services";
import { POSTS } from "./content-pack/posts";
import { CORE_PAGES, PLATFORM_PAGES, TOPIC_PAGES, LOCATION_TEMPLATES, SAMPLE_LOCATIONS, MODULES, FORM } from "./content-pack/pages";

type Sql = postgres.Sql<any>;
const BUILTIN = ["home", "services", "work", "case-studies", "pricing", "about", "blog", "faq", "help", "contact", "privacy", "terms"];

export interface PackReport { created: number; updated: number; skipped: number; trashed: number }

/** Installs or refreshes the starter content. "missing" never touches anything that exists; "replace" rewrites built-in pages and sample content (previous sample content goes to the trash). */
export async function installPack(sql: Sql, mode: "missing" | "replace"): Promise<PackReport> {
  const r: PackReport = { created: 0, updated: 0, skipped: 0, trashed: 0 };
  // drizzle (used by the app) replaces the client's JSON and date serializers, so values are sent as explicit text and cast in SQL.
  const j = (v: any) => JSON.stringify(v);
  const replace = mode === "replace";

  if (replace) {
    // Only the old built-in sample items are moved to the trash. Anything you created yourself is kept.
    const OLD: Record<string, string[]> = {
      services: ["web-design", "marketing-automation", "care-plan"], projects: ["clinic-booking-website", "outdoor-gear-store", "law-firm-lead-engine"],
      caseStudies: ["clinic-booking-journey"], team: ["founder", "designer"], posts: ["how-to-brief-a-web-agency"], categories: ["guides"],
      faqs: ["do-you-work-with-clients-abroad", "can-i-edit-the-site-myself", "how-long-until-seo-shows-results"],
    };
    for (const [col, slugs] of Object.entries(OLD)) {
      const t = await sql`UPDATE entries SET deleted_at = now() WHERE collection = ${col} AND slug IN ${sql(slugs)} AND builtin = false AND deleted_at IS NULL RETURNING id`;
      r.trashed += t.length;
      if (col === "services" && t.length) {
        const ids = t.map((x) => String(x.id));
        const pk = await sql`UPDATE entries SET deleted_at = now() WHERE collection = 'packages' AND deleted_at IS NULL AND data->>'service' IN ${sql(ids)} RETURNING id`;
        r.trashed += pk.length;
      }
    }
    const tt = await sql`UPDATE entries SET deleted_at = now() WHERE collection = 'testimonials' AND title = 'Client Name' AND data->>'quote' LIKE 'Replace with%' AND deleted_at IS NULL RETURNING id`;
    r.trashed += tt.length;
  }

  async function upsert(collection: string, slug: string, title: string, data: any, o: { status?: string; seo?: any; order?: number; featured?: boolean; builtin?: boolean; publishedAt?: Date } = {}) {
    const [ex] = await sql`SELECT id FROM entries WHERE collection = ${collection} AND slug = ${slug} AND deleted_at IS NULL LIMIT 1`;
    if (ex) {
      if (!replace) { r.skipped++; return ex.id as number; }
      await sql`UPDATE entries SET title = ${title}, data = ${j(data)}::text::jsonb, seo = ${j(o.seo || {})}::text::jsonb, sort_order = ${o.order ?? 0}, updated_at = now() WHERE id = ${ex.id}`;
      r.updated++; return ex.id as number;
    }
    const [row] = await sql`INSERT INTO entries (collection, slug, title, status, builtin, featured, sort_order, data, seo, published_at)
      VALUES (${collection}, ${slug}, ${title}, ${o.status || "published"}, ${!!o.builtin}, ${!!o.featured}, ${o.order ?? 0}, ${j(data)}::text::jsonb, ${j(o.seo || {})}::text::jsonb, ${(o.status || "published") === "published" ? (o.publishedAt || new Date()).toISOString() : null}::timestamptz) RETURNING id`;
    r.created++; return row.id as number;
  }

  // categories
  const cat: Record<string, number> = {};
  for (const [slug, title, description, color] of CATEGORIES) cat[slug] = await upsert("categories", slug, title, { description, ...(color ? { color } : {}) }, { order: Object.keys(cat).length });

  // services
  const svc: Record<string, number> = {};
  for (const [i, s] of SERVICES.entries()) {
    svc[s.slug] = await upsert("services", s.slug, s.title, {
      icon: s.icon, summary: s.summary, description: s.description,
      includes: s.includes.map((title) => ({ title, text: "" })), steps: s.steps.map(([title, text]) => ({ title, text })), faq: s.faq.map(([q, a]) => ({ q, a })),
    }, { order: i, featured: i < 3, seo: { schemaType: "Service" } });
  }

  // packages (no slug: match by title and service)
  for (const [i, p] of PACKAGES.entries()) {
    const sid = svc[p.service];
    const [ex] = await sql`SELECT id FROM entries WHERE collection = 'packages' AND title = ${p.title} AND (data->>'service')::int = ${sid} AND deleted_at IS NULL LIMIT 1`;
    const data = { service: sid, price: p.price, ...(p.priceMax ? { priceMax: p.priceMax } : {}), currency: "USD", billing: p.billing, delivery: p.delivery, summary: p.summary, features: p.features, highlight: !!p.highlight };
    if (ex) { r.skipped++; continue; } // existing packages (and your prices) are never overwritten
    await sql`INSERT INTO entries (collection, slug, title, status, sort_order, data, published_at) VALUES ('packages', '', ${p.title}, 'published', ${i}, ${j(data)}::text::jsonb, now())`; r.created++;
  }

  // FAQs
  for (const [i, [q, a, group, help]] of FAQS.entries()) await upsert("faqs", slugify(q), q, { answer: a, category: group, showOnFaq: true, showInHelp: help }, { order: i });

  // blog posts, spread over recent weeks so they sort naturally
  for (const [i, p] of POSTS.entries()) {
    const when = new Date(Date.now() - (i * 9 + 2) * 86400000);
    await upsert("posts", p.slug, p.title, { excerpt: p.excerpt, body: p.body, category: cat[p.category], tags: p.tags, kind: "article" }, { order: i, publishedAt: when, seo: { schemaType: "BlogPosting", metaDescription: p.excerpt } });
  }

  // pages
  const pages = [...CORE_PAGES, ...PLATFORM_PAGES, ...TOPIC_PAGES, ...LOCATION_TEMPLATES];
  for (const [i, p] of pages.entries()) {
    const builtin = BUILTIN.includes(p.slug);
    const blocks = p.blocks.map(([type, data]) => newBlock(type, data, builtin));
    await upsert("pages", p.slug, p.title, { blocks, ...(p.template ? { template: true } : {}) }, { status: p.status || "published", seo: { schemaType: p.schema, ...(p.seo || {}) }, order: i, builtin });
  }

  // sample location pages (drafts), created once
  const [hasLoc] = await sql`SELECT id FROM entries WHERE collection = 'pages' AND deleted_at IS NULL AND data ? 'location' LIMIT 1`;
  if (!hasLoc) {
    for (const s of SAMPLE_LOCATIONS) {
      const tpl = LOCATION_TEMPLATES.find((t) => t.slug === s.template)!;
      const loc = s.location.split(",").map((x) => x.trim());
      const pat = s.industry ? DEFAULT_PATTERNS.withIndustry : DEFAULT_PATTERNS.withoutIndustry;
      const page = buildLocationPage({ blocks: tpl.blocks }, { service: s.service, industry: s.industry, location: s.location, city: loc[0], state: loc.slice(1).join(", ") }, pat);
      await upsert("pages", page.slug, page.title, { blocks: page.blocks, location: page.location }, { status: "draft", seo: page.seo });
    }
  }

  // custom modules
  for (const m of MODULES) await upsert("modules", m.slug, m.title, { description: m.description, fields: m.fields, html: m.html, css: m.css }, { status: "published" });

  // contact form
  await upsert("forms", FORM.slug, FORM.title, FORM.data, { status: "published" });

  // settings
  await sql`INSERT INTO settings (key, value) VALUES ('general', ${j({ packVersion: PACK_VERSION })}::text::jsonb) ON CONFLICT (key) DO UPDATE SET value = settings.value || EXCLUDED.value, updated_at = now()`;
  if (replace) {
    await sql`INSERT INTO settings (key, value) VALUES ('identity', ${j({ tagline: IDENTITY.tagline, description: IDENTITY.description, longDescription: IDENTITY.longDescription })}::text::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = settings.value || EXCLUDED.value, updated_at = now()`;
    await sql`INSERT INTO settings (key, value) VALUES ('navigation', ${j(NAVIGATION)}::text::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  }
  return r;
}
