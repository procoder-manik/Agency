export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { and, desc, eq, isNull, sql as dsql } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fetchSource } from "@/lib/chat/sources";
import { resetKbCache } from "@/lib/chat/engine";

const S = schema.chatSources;
const MAX_SOURCES = 150;

export const GET = api(async () => {
  await requireApi("admin");
  const rows = await db().select({ id: S.id, kind: S.kind, title: S.title, url: S.url, status: S.status, error: S.error, fetchedAt: S.fetchedAt, createdAt: S.createdAt, chars: dsql<number>`length(${S.content})::int`, preview: dsql<string>`left(${S.content}, 220)` })
    .from(S).where(isNull(S.deletedAt)).orderBy(desc(S.createdAt));
  return { items: rows };
});

async function ingest(url: string) {
  try { const r = await fetchSource(url); return { ok: true as const, ...r }; }
  catch (e: any) { return { ok: false as const, error: String(e?.message || "Could not read the page.").slice(0, 300) }; }
}

export const POST = api(async (req: Request) => {
  await requireApi("admin");
  const b = await req.json();
  const [{ n }] = await db().select({ n: dsql<number>`count(*)::int` }).from(S).where(isNull(S.deletedAt));
  if (b.action === "add_urls") {
    const urls = Array.from(new Set((Array.isArray(b.urls) ? b.urls : String(b.urls || "").split(/[\s,]+/)).map((u: any) => String(u).trim()).filter(Boolean))).slice(0, 20) as string[];
    if (!urls.length) throw new HttpError(400, "Paste at least one page link.");
    if (n + urls.length > MAX_SOURCES) throw new HttpError(400, `You can keep up to ${MAX_SOURCES} sources. Remove some first.`);
    const results: { url: string; ok: boolean; error?: string }[] = [];
    for (const raw of urls) {
      let url: string; try { const u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw); u.hash = ""; url = u.toString(); } catch { results.push({ url: raw, ok: false, error: "Not a valid link." }); continue; }
      const [dup] = await db().select({ id: S.id }).from(S).where(and(eq(S.url, url), isNull(S.deletedAt))).limit(1);
      if (dup) { results.push({ url, ok: false, error: "Already added." }); continue; }
      const r = await ingest(url);
      await db().insert(S).values({ kind: "url", url, title: r.ok ? r.title.slice(0, 200) : url, content: r.ok ? r.content : "", status: r.ok ? "ok" : "error", error: r.ok ? "" : r.error, fetchedAt: new Date() });
      results.push({ url, ok: r.ok, error: r.ok ? undefined : r.error });
    }
    resetKbCache(); return { results };
  }
  if (b.action === "add_text") {
    const content = String(b.content || "").trim().slice(0, 20000); const title = String(b.title || "").trim().slice(0, 200);
    if (content.length < 20) throw new HttpError(400, "Write a little more: at least a sentence or two.");
    if (n >= MAX_SOURCES) throw new HttpError(400, `You can keep up to ${MAX_SOURCES} sources. Remove some first.`);
    const [row] = await db().insert(S).values({ kind: "text", title: title || content.slice(0, 60), content, status: "ok", fetchedAt: new Date() }).returning({ id: S.id });
    resetKbCache(); return { id: row.id };
  }
  if (b.action === "update_text") {
    const content = String(b.content || "").trim().slice(0, 20000); const title = String(b.title || "").trim().slice(0, 200);
    if (content.length < 20) throw new HttpError(400, "Write a little more: at least a sentence or two.");
    await db().update(S).set({ title: title || content.slice(0, 60), content, updatedAt: new Date() }).where(and(eq(S.id, Number(b.id)), eq(S.kind, "text")));
    resetKbCache(); return { ok: true };
  }
  if (b.action === "refresh") {
    const [row] = await db().select().from(S).where(eq(S.id, Number(b.id))).limit(1);
    if (!row || row.kind !== "url") throw new HttpError(404, "Source not found.");
    const r = await ingest(row.url);
    await db().update(S).set(r.ok ? { title: r.title.slice(0, 200), content: r.content, status: "ok", error: "", fetchedAt: new Date(), updatedAt: new Date() } : { status: "error", error: r.error, updatedAt: new Date() }).where(eq(S.id, row.id));
    resetKbCache(); return { ok: r.ok, error: r.ok ? undefined : r.error };
  }
  if (b.action === "get_text") {
    const [row] = await db().select({ id: S.id, title: S.title, content: S.content }).from(S).where(eq(S.id, Number(b.id))).limit(1);
    return { item: row };
  }
  throw new HttpError(400, "Unknown action.");
});

export const DELETE = api(async (req: Request) => {
  await requireApi("admin");
  await db().update(S).set({ deletedAt: new Date() }).where(eq(S.id, Number(new URL(req.url).searchParams.get("id"))));
  resetKbCache(); return { ok: true };
});
