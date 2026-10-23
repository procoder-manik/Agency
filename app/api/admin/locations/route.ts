export const dynamic = "force-dynamic";
import { and, desc, eq, isNull, sql as dsql } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { createEntry } from "@/lib/entries-admin";
import { audit } from "@/lib/content";
import { buildLocationPage, DEFAULT_PATTERNS, parseIndustries, parseLocations } from "@/lib/templating";

const E = schema.entries;
const MAX = 300;

export const GET = api(async () => {
  await requireApi();
  const rows = await db().select({ id: E.id, title: E.title, slug: E.slug, status: E.status, data: E.data }).from(E).where(and(eq(E.collection, "pages"), isNull(E.deletedAt))).orderBy(desc(E.updatedAt));
  return {
    templates: rows.filter((r) => r.data?.template).map((r) => ({ id: r.id, title: r.title, usesIndustry: JSON.stringify(r.data?.blocks || []).includes("{{industr") })),
    pages: rows.filter((r) => r.data?.location && !r.data?.template).map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status, location: r.data.location })),
  };
});

/** Create many location pages from a template page: services x industries x locations. */
export const POST = api(async (req: Request) => {
  const user = await requireApi();
  const b = await req.json();
  const [tpl] = await db().select().from(E).where(and(eq(E.id, Number(b.templateId)), eq(E.collection, "pages"), isNull(E.deletedAt))).limit(1);
  if (!tpl || !tpl.data?.template) throw new Error("Choose a template page.");
  const service = String(b.service || "").trim(); if (!service) throw new Error("Enter the service.");
  const locations = parseLocations(String(b.locations || "")); if (!locations.length) throw new Error("Add at least one location.");
  const usesIndustry = JSON.stringify(tpl.data.blocks || []).includes("{{industr");
  const industries = usesIndustry ? parseIndustries(String(b.industries || "")) : [{ industry: "", industries: "" }];
  if (usesIndustry && !industries.length) throw new Error("This template needs at least one industry.");
  if (industries.length * locations.length > MAX) throw new Error(`That would create ${industries.length * locations.length} pages. The limit per run is ${MAX}.`);
  const defaults = usesIndustry ? DEFAULT_PATTERNS.withIndustry : DEFAULT_PATTERNS.withoutIndustry;
  const patterns = { title: String(b.titlePattern || defaults.title), metaTitle: String(b.metaTitlePattern || defaults.metaTitle), metaDescription: String(b.metaDescriptionPattern || defaults.metaDescription) };
  const existing = new Set((await db().select({ slug: E.slug }).from(E).where(and(eq(E.collection, "pages"), isNull(E.deletedAt)))).map((r) => r.slug));
  const plan: { title: string; slug: string; exists: boolean; page?: ReturnType<typeof buildLocationPage> }[] = [];
  for (const ind of industries) for (const loc of locations) {
    const page = buildLocationPage({ blocks: tpl.data.blocks }, { service, industry: ind.industry, industries: ind.industries, location: loc.location, city: loc.city, state: loc.state, facts: loc.facts }, patterns);
    plan.push({ title: page.title, slug: page.slug, exists: existing.has(page.slug), page });
    existing.add(page.slug);
  }
  if (b.dryRun) return { total: plan.length, willCreate: plan.filter((p) => !p.exists).length, items: plan.slice(0, 80).map(({ title, slug, exists }) => ({ title, slug, exists })) };
  const status = b.status === "published" ? "published" : "draft";
  let created = 0, skipped = 0; const out: { id: number; slug: string }[] = [];
  for (const p of plan) {
    if (p.exists) { skipped++; continue; }
    const row = await createEntry(user, { collection: "pages", title: p.page!.title, slug: p.page!.slug, status, data: { blocks: p.page!.blocks, location: p.page!.location }, seo: p.page!.seo });
    out.push({ id: row.id, slug: row.slug }); created++;
  }
  await audit(user.email, "generate location pages", `${created} created for ${service}`);
  return { created, skipped, items: out.slice(0, 50) };
});
void dsql;
