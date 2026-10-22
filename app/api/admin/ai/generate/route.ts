export const dynamic = "force-dynamic";
import { and, eq, isNull } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { getEntry, uniqueSlug } from "@/lib/content";
import { createEntry } from "@/lib/entries-admin";
import { runTask } from "@/lib/ai/tasks";
import { aiAvailable } from "@/lib/ai/providers";
import { logAi } from "@/lib/ai/log";
import { rateLimit } from "@/lib/ratelimit";
import { BUILTIN_SLUGS } from "@/lib/blocks";
import { slugify } from "@/lib/util";

export const maxDuration = 60;

async function taken(slug: string) {
  if (BUILTIN_SLUGS.includes(slug)) return true;
  const r = await db().select({ id: schema.entries.id }).from(schema.entries).where(and(eq(schema.entries.collection, "pages"), eq(schema.entries.slug, slug), isNull(schema.entries.deletedAt))).limit(1);
  return !!r[0];
}

/** AI generators that create draft pages. Never overwrites a page that already exists at the target address. */
export const POST = api(async (req: Request) => {
  const u = await requireApi();
  if (!rateLimit("ai:" + u.uid, 40, 60_000)) throw new HttpError(429, "Too many AI requests. Wait a minute.");
  if (!(await aiAvailable())) throw new HttpError(400, "AI is off: add a free AI key in Admin > AI.");
  const b = await req.json();
  try {
    if (b.kind === "servicePage") {
      const svc = await getEntry(Number(b.serviceId));
      if (!svc || svc.collection !== "services") throw new Error("Service not found.");
      const slug = slugify(svc.slug);
      if (await taken(slug)) return { status: "skipped", slug, reason: `A page already exists at /${slug}` };
      const r = await runTask("servicePage", { serviceId: svc.id, service: { title: svc.title, ...svc.data } });
      const page = await createEntry(u, { collection: "pages", title: r.data.title, slug, status: "draft", data: { blocks: r.data.blocks }, seo: r.data.seo });
      await logAi(u.email, "servicePage", r.provider, r.model, svc.title);
      return { status: "created", id: page.id, slug: page.slug };
    }
    if (b.kind === "locationPage") {
      const svc = await getEntry(Number(b.serviceId));
      if (!svc) throw new Error("Pick a service.");
      const slug = slugify(b.type === "industry" ? `${svc.slug}-for-${b.name}` : `${svc.slug}-${b.name}`);
      if (await taken(slug)) return { status: "skipped", slug, reason: `A page already exists at /${slug}` };
      const r = await runTask("locationPage", { kind: b.type, name: b.name, serviceId: svc.id, serviceName: svc.title, facts: b.facts, others: b.others });
      const page = await createEntry(u, { collection: "pages", title: r.data.title, slug, status: "draft", data: { blocks: r.data.blocks }, seo: r.data.seo });
      await logAi(u.email, "locationPage", r.provider, r.model, b.name);
      return { status: "created", id: page.id, slug: page.slug };
    }
    if (b.kind === "page") {
      const r = await runTask("page", b);
      const slug = await uniqueSlug("pages", BUILTIN_SLUGS.includes(r.data.slug) ? `${r.data.slug}-page` : r.data.slug);
      const page = await createEntry(u, { collection: "pages", title: r.data.title, slug, status: "draft", data: { blocks: r.data.blocks }, seo: r.data.seo });
      await logAi(u.email, "page", r.provider, r.model, b.topic);
      return { status: "created", id: page.id, slug: page.slug };
    }
    throw new Error("Unknown generator.");
  } catch (e: any) {
    if (e instanceof HttpError) throw e;
    await logAi(u.email, String(b.kind), "", "", e.message, false);
    throw new HttpError(502, e.message);
  }
});
