import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "./db";
import { getCollection } from "./collections";
import { audit, getEntry, uniqueSlug } from "./content";
import { slugify } from "./util";
import { BUILTIN_SLUGS, newBlock, type Block } from "./blocks";
import { getSetting, saveSetting } from "./settings";
import { setMenu } from "./menu";
import type { Session } from "./jwt";

const E = schema.entries;
export const bust = () => revalidatePath("/", "layout");

function cleanBlocks(blocks: any): Block[] {
  return (Array.isArray(blocks) ? blocks : []).map((b) => ({ id: String(b.id || newBlock(b.type).id), type: String(b.type), hidden: !!b.hidden, ...(b.required ? { required: true } : {}), data: b.data && typeof b.data === "object" ? b.data : {} }));
}

export async function createEntry(user: Session, input: any) {
  const col = getCollection(input.collection); if (!col) throw new Error("Unknown collection.");
  const title = String(input.title || `Untitled ${col.singular.toLowerCase()}`).slice(0, 300);
  const slug = col.hasSlug ? await uniqueSlug(col.key, slugify(input.slug || title)) : "";
  if (col.key === "pages" && BUILTIN_SLUGS.includes(slug)) throw new Error("That address belongs to a built-in page.");
  const data = { ...(input.data || {}) }; if (col.key === "pages") data.blocks = cleanBlocks(data.blocks);
  const status = input.status === "published" ? "published" : "draft";
  const [row] = await db().insert(E).values({ collection: col.key, title, slug, status, data, seo: input.seo || {}, sortOrder: Number(input.sortOrder) || 0, featured: !!input.featured, publishedAt: status === "published" ? new Date() : null }).returning();
  await audit(user.email, "create", `${col.singular}: ${title}`);
  bust();
  return row;
}

export async function updateEntry(user: Session, id: number, input: any) {
  const cur = await getEntry(id); if (!cur) throw new Error("Not found.");
  const col = getCollection(cur.collection)!;
  const patch: any = { updatedAt: new Date() };
  if (input.title !== undefined) patch.title = String(input.title).slice(0, 300);
  if (input.slug !== undefined && col.hasSlug && !cur.builtin) {
    const s = slugify(input.slug || input.title || cur.title);
    if (col.key === "pages" && BUILTIN_SLUGS.includes(s) && s !== cur.slug) throw new Error("That address belongs to a built-in page.");
    patch.slug = await uniqueSlug(col.key, s, id);
  }
  if (input.status !== undefined) {
    patch.status = input.status === "published" ? "published" : "draft";
    if (patch.status === "published" && !cur.publishedAt) patch.publishedAt = new Date();
    if (patch.status !== cur.status) await audit(user.email, patch.status === "published" ? "publish" : "unpublish", `${col.singular}: ${cur.title}`);
  }
  if (input.data !== undefined) {
    const data = { ...input.data };
    if (col.key === "pages") {
      data.blocks = cleanBlocks(data.blocks);
      if (cur.builtin) { // required parts cannot be deleted
        const req = ((cur.data.blocks || []) as Block[]).filter((b) => b.required);
        for (const r of req) if (!data.blocks.some((b: Block) => b.id === r.id)) data.blocks.push({ ...r, hidden: true });
      }
    }
    patch.data = data;
  }
  if (input.seo !== undefined) patch.seo = input.seo;
  if (input.sortOrder !== undefined) patch.sortOrder = Number(input.sortOrder) || 0;
  if (input.featured !== undefined) patch.featured = !!input.featured;
  if (input.publishedAt) patch.publishedAt = new Date(input.publishedAt);
  const [row] = await db().update(E).set(patch).where(eq(E.id, id)).returning();
  // menu toggles from the page editor write into the one central navigation setting
  if (col.key === "pages" && input.menu) {
    const ident = await getSetting("identity");
    const nav = await getSetting("navigation");
    const path = row.slug === "home" ? "/" : `/${row.slug}`;
    let next = nav;
    if (cur.slug !== row.slug) { const old = cur.slug === "home" ? "/" : `/${cur.slug}`; next = setMenu(next, old, row.title, { header: false, footer: false }, ident.domain); }
    next = setMenu(next, path, row.title, { header: !!input.menu.header, footer: !!input.menu.footer, footerCol: input.menu.footerCol }, ident.domain);
    await saveSetting("navigation", next);
  }
  bust();
  return row;
}

export async function bulk(user: Session, ids: number[], action: string) {
  const list = ids.map(Number).filter(Number.isInteger); if (!list.length) return { count: 0 };
  const rows = await db().select().from(E).where(inArray(E.id, list));
  let count = 0;
  for (const r of rows) {
    const col = getCollection(r.collection)!;
    if (action === "publish" || action === "draft") { await db().update(E).set({ status: action === "publish" ? "published" : "draft", updatedAt: new Date(), ...(action === "publish" && !r.publishedAt ? { publishedAt: new Date() } : {}) }).where(eq(E.id, r.id)); await audit(user.email, action === "publish" ? "publish" : "unpublish", `${col.singular}: ${r.title}`); }
    else if (action === "trash") { if (r.builtin) continue; await db().update(E).set({ deletedAt: new Date() }).where(eq(E.id, r.id)); await audit(user.email, "trash", `${col.singular}: ${r.title}`); }
    else if (action === "restore") { const slug = r.slug ? await uniqueSlug(r.collection, r.slug, r.id) : ""; await db().update(E).set({ deletedAt: null, slug }).where(eq(E.id, r.id)); await audit(user.email, "restore", `${col.singular}: ${r.title}`); }
    else if (action === "delete") { if (r.builtin || !r.deletedAt) continue; await db().delete(E).where(eq(E.id, r.id)); await audit(user.email, "delete permanently", `${col.singular}: ${r.title}`); }
    else if (action === "duplicate") {
      const slug = col.hasSlug ? await uniqueSlug(r.collection, `${r.slug}-copy`) : "";
      const data = { ...r.data }; if (Array.isArray(data.blocks)) data.blocks = data.blocks.map((b: Block) => { const { required, ...rest } = b; return { ...rest, id: newBlock(b.type).id }; });
      await db().insert(E).values({ collection: r.collection, title: `${r.title} (copy)`, slug, status: "draft", data, seo: { ...r.seo, canonical: "" }, sortOrder: r.sortOrder, featured: false });
    }
    else if (action === "feature" || action === "unfeature") await db().update(E).set({ featured: action === "feature" }).where(eq(E.id, r.id));
    else continue;
    count++;
  }
  bust();
  return { count };
}

export async function emptyTrash(user: Session, collection: string) {
  const { isNotNull } = await import("drizzle-orm");
  const del = await db().delete(E).where(and(eq(E.collection, collection), eq(E.builtin, false), isNotNull(E.deletedAt))).returning({ id: E.id });
  await audit(user.email, "empty trash", `${getCollection(collection)?.label || collection}: ${del.length} items`);
  return { count: del.length };
}
