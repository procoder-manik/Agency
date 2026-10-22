export const dynamic = "force-dynamic";
import { desc, eq } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audit } from "@/lib/content";

const R = schema.redirects;
const clean = (p: string) => { const s = String(p || "").trim(); if (/^https?:\/\//.test(s)) return s; return ("/" + s.replace(/^\/+/, "")).replace(/\/+$/, "") || "/"; };
export const GET = api(async () => { await requireApi(); return { items: await db().select().from(R).orderBy(desc(R.createdAt)) }; });
export const POST = api(async (req: Request) => {
  const u = await requireApi(); const b = await req.json();
  const from = clean(b.from); const to = clean(b.to);
  if (/^https?:/.test(from)) throw new Error("“From” must be a path on this site, like /old-page.");
  if (from === to) throw new Error("A redirect can't point to itself.");
  await db().insert(R).values({ fromPath: from, toPath: to, type: Number(b.type) === 302 ? 302 : 301 }).onConflictDoUpdate({ target: R.fromPath, set: { toPath: to, type: Number(b.type) === 302 ? 302 : 301, updatedAt: new Date() } });
  await db().delete(schema.notFoundLog).where(eq(schema.notFoundLog.path, from));
  await audit(u.email, "add redirect", `${from} → ${to}`);
  return { ok: true };
});
export const DELETE = api(async (req: Request) => { await requireApi(); await db().delete(R).where(eq(R.id, Number(new URL(req.url).searchParams.get("id")))); return { ok: true }; });
