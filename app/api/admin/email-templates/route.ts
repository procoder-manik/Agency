export const dynamic = "force-dynamic";
import { desc, eq, isNull, and } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { getBrand, starterTemplates, stripUnsafe } from "@/lib/email-templates";

const T = schema.emailTemplates;
export const GET = api(async (req: Request) => {
  await requireApi("admin");
  if (new URL(req.url).searchParams.get("starters")) return { starters: starterTemplates(await getBrand()) };
  return { items: await db().select().from(T).where(isNull(T.deletedAt)).orderBy(desc(T.updatedAt)) };
});
export const POST = api(async (req: Request) => {
  await requireApi("admin");
  const b = await req.json();
  const v = { name: String(b.name || "").trim().slice(0, 120), subject: String(b.subject || "").slice(0, 200), preheader: String(b.preheader || "").slice(0, 200), html: stripUnsafe(String(b.html || "")).slice(0, 400_000) };
  if (!v.name) throw new HttpError(400, "Give the template a name.");
  if (b.id) { const [row] = await db().update(T).set({ ...v, updatedAt: new Date() }).where(eq(T.id, Number(b.id))).returning(); return { item: row }; }
  const [row] = await db().insert(T).values(v).returning(); return { item: row };
});
export const DELETE = api(async (req: Request) => {
  await requireApi("admin");
  await db().update(T).set({ deletedAt: new Date() }).where(and(eq(T.id, Number(new URL(req.url).searchParams.get("id")))));
  return { ok: true };
});
