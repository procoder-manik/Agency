import { cache } from "react";
import { and, asc, desc, eq, ilike, inArray, isNotNull, isNull, lt, or, sql as dsql } from "drizzle-orm";
import { db, schema } from "./db";

export type Entry = typeof schema.entries.$inferSelect;
const E = schema.entries;

export interface ListOpts { status?: "all" | "published" | "draft" | "trash"; q?: string; limit?: number; offset?: number; featured?: boolean; sort?: string; dir?: "asc" | "desc" }

export async function listEntries(collection: string, o: ListOpts = {}) {
  const where = [eq(E.collection, collection)];
  if (o.status === "trash") where.push(isNotNull(E.deletedAt)); else where.push(isNull(E.deletedAt));
  if (o.status === "published" || o.status === "draft") where.push(eq(E.status, o.status));
  if (o.featured) where.push(eq(E.featured, true));
  if (o.q) where.push(or(ilike(E.title, `%${o.q}%`), ilike(E.slug, `%${o.q}%`), dsql`${E.data}::text ILIKE ${"%" + o.q + "%"}`)!);
  const sortCol = ({ title: E.title, updated: E.updatedAt, created: E.createdAt, status: E.status, order: E.sortOrder } as any)[o.sort || "order"] || E.sortOrder;
  const dir = o.dir === "desc" ? desc : asc;
  return db().select().from(E).where(and(...where))
    .orderBy(dir(sortCol), desc(E.createdAt)).limit(o.limit ?? 500).offset(o.offset ?? 0);
}

export async function countEntries(collection: string) {
  const rows = await db().select({ status: E.status, deleted: dsql<boolean>`${E.deletedAt} IS NOT NULL`, n: dsql<number>`count(*)::int` })
    .from(E).where(eq(E.collection, collection)).groupBy(E.status, dsql`${E.deletedAt} IS NOT NULL`);
  const c = { all: 0, published: 0, draft: 0, trash: 0 };
  for (const r of rows) { if (r.deleted) c.trash += r.n; else { c.all += r.n; (c as any)[r.status] = ((c as any)[r.status] || 0) + r.n; } }
  return c;
}

export async function getEntry(id: number) {
  const r = await db().select().from(E).where(eq(E.id, id)).limit(1);
  return r[0] || null;
}

/** Public: all published, non-trashed items of a collection, cached for the request. */
export const getPublished = cache(async (collection: string): Promise<Entry[]> => {
  try {
    return await db().select().from(E).where(and(eq(E.collection, collection), eq(E.status, "published"), isNull(E.deletedAt)))
      .orderBy(asc(E.sortOrder), desc(E.publishedAt), desc(E.createdAt));
  } catch (e) { console.error("[content]", (e as Error).message); return []; }
});

export const getPublishedBySlug = cache(async (collection: string, slug: string) => {
  const all = await getPublished(collection);
  return all.find((e) => e.slug === slug) || null;
});

export async function getByIds(ids: number[]) {
  const clean = ids.map(Number).filter((n) => Number.isInteger(n));
  if (!clean.length) return [];
  return db().select().from(E).where(and(inArray(E.id, clean), isNull(E.deletedAt)));
}

/** Resolve relation ids against a published collection. */
export async function related(collection: string, ids: any): Promise<Entry[]> {
  const list = (Array.isArray(ids) ? ids : ids ? [ids] : []).map(Number);
  const all = await getPublished(collection);
  return list.map((id) => all.find((e) => e.id === id)).filter(Boolean) as Entry[];
}

export async function audit(email: string, action: string, target: string) {
  try { await db().insert(schema.auditLog).values({ userEmail: email, action, target }); } catch {}
}

export async function purgeTrash(days: number) {
  const cutoff = new Date(Date.now() - Math.max(1, days) * 86400000);
  await db().delete(E).where(and(isNotNull(E.deletedAt), lt(E.deletedAt, cutoff)));
  await db().delete(schema.media).where(and(isNotNull(schema.media.deletedAt), lt(schema.media.deletedAt, cutoff)));
}

export async function uniqueSlug(collection: string, base: string, exceptId?: number) {
  let slug = base || "item"; let n = 1;
  for (;;) {
    const r = await db().select({ id: E.id }).from(E).where(and(eq(E.collection, collection), eq(E.slug, slug), isNull(E.deletedAt))).limit(1);
    if (!r[0] || r[0].id === exceptId) return slug;
    slug = `${base}-${++n}`;
  }
}
