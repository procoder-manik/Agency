export const dynamic = "force-dynamic";
import { desc, eq, isNull } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";

const S = schema.submissions;
export const GET = api(async (req: Request) => {
  await requireApi();
  const rows = await db().select().from(S).where(isNull(S.deletedAt)).orderBy(desc(S.createdAt)).limit(2000);
  if (new URL(req.url).searchParams.get("format") === "csv") {
    const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.values))));
    const q = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [["date", "form", "read", ...keys].map(q).join(","), ...rows.map((r) => [r.createdAt.toISOString(), r.formName, r.read ? "yes" : "no", ...keys.map((k) => r.values[k])].map(q).join(","))].join("\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="submissions-${new Date().toISOString().slice(0, 10)}.csv"` } });
  }
  return { items: rows };
});
export const PUT = api(async (req: Request) => { await requireApi(); const { ids, read } = await req.json(); for (const id of ids || []) await db().update(S).set({ read: !!read, updatedAt: new Date() }).where(eq(S.id, Number(id))); return { ok: true }; });
export const DELETE = api(async (req: Request) => { await requireApi(); const id = Number(new URL(req.url).searchParams.get("id")); await db().update(S).set({ deletedAt: new Date() }).where(eq(S.id, id)); return { ok: true }; });
