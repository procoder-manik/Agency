export const dynamic = "force-dynamic";
import { desc, eq, isNull } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audienceStats, countAudience } from "@/lib/campaigns";
import { stripUnsafe } from "@/lib/email-templates";

const C = schema.campaigns;
const aud = (a: any) => ({ verifiedOnly: a?.verifiedOnly !== false, statuses: Array.isArray(a?.statuses) ? a.statuses.filter((x: any) => typeof x === "string").slice(0, 6) : [], source: String(a?.source || "").slice(0, 100) });

export const GET = api(async () => {
  await requireApi("admin");
  return { items: await db().select().from(C).where(isNull(C.deletedAt)).orderBy(desc(C.createdAt)).limit(200), stats: await audienceStats() };
});
export const POST = api(async (req: Request) => {
  await requireApi("admin");
  const b = await req.json();
  if (b.action === "count") return { count: await countAudience(aud(b.audience)) };
  if (b.action === "duplicate") {
    const [src] = await db().select().from(C).where(eq(C.id, Number(b.id))).limit(1); if (!src) throw new HttpError(404, "Not found.");
    const [row] = await db().insert(C).values({ name: src.name + " copy", subject: src.subject, preheader: src.preheader, html: src.html, templateId: src.templateId, audience: src.audience }).returning(); return { item: row };
  }
  const v = { name: String(b.name || "").trim().slice(0, 120), subject: String(b.subject || "").slice(0, 200), preheader: String(b.preheader || "").slice(0, 200), html: stripUnsafe(String(b.html || "")).slice(0, 400_000), templateId: b.templateId ? Number(b.templateId) : null, audience: aud(b.audience) };
  if (!v.name) throw new HttpError(400, "Give the campaign a name.");
  if (b.id) {
    const [cur] = await db().select().from(C).where(eq(C.id, Number(b.id))).limit(1);
    if (cur && cur.status !== "draft") throw new HttpError(400, "Only draft campaigns can be edited. Duplicate it to send again.");
    const [row] = await db().update(C).set({ ...v, updatedAt: new Date() }).where(eq(C.id, Number(b.id))).returning(); return { item: row };
  }
  const [row] = await db().insert(C).values(v).returning(); return { item: row };
});
export const DELETE = api(async (req: Request) => {
  await requireApi("admin");
  await db().update(C).set({ deletedAt: new Date() }).where(eq(C.id, Number(new URL(req.url).searchParams.get("id")))); return { ok: true };
});
