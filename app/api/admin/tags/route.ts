export const dynamic = "force-dynamic";
import { and, eq, isNull, sql as dsql } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { getCollection } from "@/lib/collections";
import { bust } from "@/lib/entries-admin";

const E = schema.entries;
/** Collections that have a free-form "tags" field. */
const taggable = (k: string) => { const c = getCollection(k); return !!c && c.fields.some((f) => f.name === "tags" && f.type === "tags"); };
const clean = (v: any) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, 60);

export const GET = api(async (req: Request) => {
  await requireApi();
  const col = new URL(req.url).searchParams.get("collection") || "";
  if (!taggable(col)) throw new HttpError(400, "This content type has no tags.");
  const rows = await db().select({ id: E.id, title: E.title, tags: dsql<any>`${E.data}->'tags'` }).from(E).where(and(eq(E.collection, col), isNull(E.deletedAt)));
  const map = new Map<string, { name: string; count: number; items: { id: number; title: string }[] }>();
  for (const r of rows) for (const t of Array.isArray(r.tags) ? r.tags : []) {
    const name = clean(t); if (!name) continue; const k = name.toLowerCase();
    const cur = map.get(k) || { name, count: 0, items: [] }; cur.count++; if (cur.items.length < 5) cur.items.push({ id: r.id, title: r.title }); map.set(k, cur);
  }
  return { items: Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)) };
});

async function rewrite(col: string, from: string, to: string | null) {
  const rows = await db().select({ id: E.id, tags: dsql<any>`${E.data}->'tags'` }).from(E).where(and(eq(E.collection, col), isNull(E.deletedAt)));
  let n = 0;
  for (const r of rows) {
    const tags: string[] = Array.isArray(r.tags) ? r.tags.map(clean) : []; if (!tags.some((t) => t.toLowerCase() === from.toLowerCase())) continue;
    const next: string[] = []; for (const t of tags) { const out = t.toLowerCase() === from.toLowerCase() ? to : t; if (out && !next.some((x) => x.toLowerCase() === out.toLowerCase())) next.push(out); }
    await db().update(E).set({ data: dsql`jsonb_set(${E.data}, '{tags}', ${JSON.stringify(next)}::jsonb)`, updatedAt: new Date() }).where(eq(E.id, r.id)); n++;
  }
  bust(); return n;
}

export const POST = api(async (req: Request) => {
  await requireApi();
  const b = await req.json(); const col = String(b.collection || "");
  if (!taggable(col)) throw new HttpError(400, "This content type has no tags.");
  const from = clean(b.from), to = clean(b.to);
  if (!from || !to) throw new HttpError(400, "Enter the new tag name.");
  return { updated: await rewrite(col, from, to) };
});
export const DELETE = api(async (req: Request) => {
  await requireApi();
  const u = new URL(req.url); const col = u.searchParams.get("collection") || ""; const tag = clean(u.searchParams.get("tag"));
  if (!taggable(col) || !tag) throw new HttpError(400, "Nothing to delete.");
  return { updated: await rewrite(col, tag, null) };
});
