export const dynamic = "force-dynamic";
import { desc, eq, isNull } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";

const L = schema.leads;
const STATUSES = ["new", "contacted", "won", "lost"];
const pick = (b: any) => ({ name: String(b.name ?? "").slice(0, 200), email: String(b.email ?? "").slice(0, 200), phone: String(b.phone ?? "").slice(0, 60), company: String(b.company ?? "").slice(0, 200), source: String(b.source ?? "manual").slice(0, 100), notes: String(b.notes ?? "").slice(0, 10000), status: STATUSES.includes(b.status) ? b.status : "new" });
export const GET = api(async () => { await requireApi(); return { items: await db().select().from(L).where(isNull(L.deletedAt)).orderBy(desc(L.createdAt)).limit(2000) }; });
export const POST = api(async (req: Request) => { await requireApi(); const [row] = await db().insert(L).values(pick(await req.json())).returning(); return { item: row }; });
export const PUT = api(async (req: Request) => { await requireApi(); const b = await req.json(); const [row] = await db().update(L).set({ ...pick(b), updatedAt: new Date() }).where(eq(L.id, Number(b.id))).returning(); return { item: row }; });
export const DELETE = api(async (req: Request) => { await requireApi(); await db().update(L).set({ deletedAt: new Date() }).where(eq(L.id, Number(new URL(req.url).searchParams.get("id")))); return { ok: true }; });
