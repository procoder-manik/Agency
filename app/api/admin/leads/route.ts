export const dynamic = "force-dynamic";
import { desc, eq, isNull } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { EMAIL_RX, newToken } from "@/lib/leads";

const L = schema.leads;
const STATUSES = ["new", "contacted", "won", "lost"];
const pick = (b: any) => {
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 200);
  if (email && !EMAIL_RX.test(email)) throw new HttpError(400, "Enter a valid email address.");
  return { name: String(b.name ?? "").slice(0, 200), email, phone: String(b.phone ?? "").slice(0, 60), company: String(b.company ?? "").slice(0, 200), source: String(b.source ?? "manual").slice(0, 100), notes: String(b.notes ?? "").slice(0, 20000), status: STATUSES.includes(b.status) ? b.status : "new" };
};
const flags = (b: any, cur?: { verified: boolean }) => ({
  ...(typeof b.verified === "boolean" ? { verified: b.verified, verifiedAt: b.verified && !cur?.verified ? new Date() : b.verified ? undefined : null } : {}),
  ...(typeof b.unsubscribed === "boolean" ? { unsubscribed: b.unsubscribed } : {}),
});
const dup = (e: any) => { if (e?.code === "23505" || /leads_email_uniq|duplicate key/i.test(e?.message || "")) throw new HttpError(409, "A lead with this email address already exists. Each email is one lead."); throw e; };
const csvCell = (v: any) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

export const GET = api(async (req: Request) => {
  await requireApi();
  const items = await db().select().from(L).where(isNull(L.deletedAt)).orderBy(desc(L.createdAt)).limit(5000);
  if (new URL(req.url).searchParams.get("format") === "csv") {
    const head = ["name", "email", "phone", "company", "source", "status", "verified", "unsubscribed", "contacts", "created"];
    const csv = [head.join(","), ...items.map((l) => [l.name, l.email, l.phone, l.company, l.source, l.status, l.verified ? "yes" : "no", l.unsubscribed ? "yes" : "no", l.contactCount, l.createdAt.toISOString()].map(csvCell).join(","))].join("\n");
    return new Response("\uFEFF" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="leads.csv"' } });
  }
  return { items: items.map(({ token, ...rest }) => rest) };
});
export const POST = api(async (req: Request) => {
  await requireApi(); const b = await req.json();
  try { const [row] = await db().insert(L).values({ ...pick(b), ...flags(b), token: newToken(), lastContactAt: new Date() }).returning(); const { token, ...out } = row; return { item: out }; } catch (e) { return dup(e); }
});
export const PUT = api(async (req: Request) => {
  await requireApi(); const b = await req.json();
  const [cur] = await db().select().from(L).where(eq(L.id, Number(b.id))).limit(1);
  if (!cur) throw new HttpError(404, "Lead not found.");
  try { const [row] = await db().update(L).set({ ...pick(b), ...flags(b, cur), updatedAt: new Date() }).where(eq(L.id, Number(b.id))).returning(); const { token, ...out } = row; return { item: out }; } catch (e) { return dup(e); }
});
export const DELETE = api(async (req: Request) => { await requireApi(); await db().update(L).set({ deletedAt: new Date() }).where(eq(L.id, Number(new URL(req.url).searchParams.get("id")))); return { ok: true }; });
