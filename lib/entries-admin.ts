import { and, eq, inArray, isNull, sql as dsql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { clearMemo } from "./memo";
import { ROUTABLE, RESERVED_FIRST, entryUrl, normalizePermalink } from "./permalinks";
import { db, schema } from "./db";
import { getCollection } from "./collections";
import { audit, getEntry, uniqueSlug } from "./content";
import { slugify } from "./util";
import { BUILTIN_SLUGS, newBlock, type Block } from "./blocks";
import { getSetting, saveSetting } from "./settings";
import { setMenu } from "./menu";
import type { Session } from "./jwt";

const E = schema.entries;
export const bust = () => { clearMemo(); revalidatePath("/", "layout"); };

function assertRole(user: Session, collection: string) {
  const col = getCollection(collection);
  if (col?.roles && !col.roles.includes(user.role)) throw new Error("Only admins can change this.");
}
/** Raw HTML blocks run as code on the public site, so only admins may add or change them. */
function assertHtmlBlocks(user: Session, next: any[], prev: any[] = []) {
  if (user.role === "admin") return;
  for (const b of next) {
    if (b?.type !== "html") continue;
    const old = prev.find((x) => x.id === b.id);
    if (!old ? (b.data?.html || b.data?.css) : (old.data?.html !== b.data?.html || old.data?.css !== b.data?.css)) throw new Error("Only admins can add or edit custom HTML sections.");
  }
}

function cleanBlocks(blocks: any): Block[] {
  return (Array.isArray(blocks) ? blocks : []).map((b) => ({ id: String(b.id || newBlock(b.type).id), type: String(b.type), hidden: !!b.hidden, ...(b.required ? { required: true } : {}), data: b.data && typeof b.data === "object" ? b.data : {} }));
}


/** Checks the custom address and parent page of an item, fills in a page's full address, and makes sure no two items share one address
 *  (that would create duplicate content and canonical problems). Changes `data` in place. */
async function applyAddress(col: { key: string }, data: Record<string, any>, slug: string, self?: { id: number; builtin?: boolean }) {
  if (!ROUTABLE.includes(col.key)) return;
  const perm = normalizePermalink(data.permalink);
  const pid = col.key === "pages" ? Number(data.parent) || 0 : 0;
  if (self?.builtin && (perm || pid)) throw new Error("Built-in pages keep their address. Create a new page if you need a custom one.");
  if (perm) {
    if (RESERVED_FIRST.includes(perm.split("/")[0])) throw new Error(`The address cannot start with "${perm.split("/")[0]}": the site uses it.`);
    data.permalink = perm;
  } else delete data.permalink;
  if (col.key === "pages") {
    if (pid) {
      if (self && pid === self.id) throw new Error("A page cannot be its own parent.");
      const parent = await getEntry(pid);
      if (!parent || parent.collection !== "pages") throw new Error("Choose an existing page as the parent.");
      let cur: typeof parent | null = parent;
      for (let i = 0; cur && i < 25; i++) { if (self && cur.id === self.id) throw new Error("That parent would create a loop (the parent is a child of this page)."); cur = (cur.data as any).parent ? await getEntry(Number((cur.data as any).parent)) : null; }
      const pPath = normalizePermalink((parent.data as any).permalink) || normalizePermalink((parent.data as any).fullPath) || parent.slug;
      data.parent = pid; data.fullPath = `${pPath}/${slug}`;
    } else { delete data.parent; delete data.fullPath; }
  }
  const url = entryUrl(col.key, slug, data);
  const rows = await db().select({ id: E.id, collection: E.collection, slug: E.slug, title: E.title, data: E.data }).from(E).where(and(inArray(E.collection, ROUTABLE), isNull(E.deletedAt)));
  for (const r of rows) {
    if (self && r.id === self.id) continue;
    if (entryUrl(r.collection, r.slug, r.data as any) === url) throw new Error(`The address ${url} is already used by "${r.title}". Choose a different address.`);
  }
}

/** When a page's address changes, every child page below it gets its new full address. */
async function refreshChildren(parentId: number, depth = 0) {
  if (depth > 20) return;
  const kids = await db().select().from(E).where(and(eq(E.collection, "pages"), isNull(E.deletedAt), dsql`${E.data}->>'parent' = ${String(parentId)}`));
  if (!kids.length) return;
  const parent = await getEntry(parentId); if (!parent) return;
  const pPath = normalizePermalink((parent.data as any).permalink) || normalizePermalink((parent.data as any).fullPath) || parent.slug;
  for (const k of kids) { const d = { ...(k.data as any), fullPath: `${pPath}/${k.slug}` }; await db().update(E).set({ data: d, updatedAt: new Date() }).where(eq(E.id, k.id)); await refreshChildren(k.id, depth + 1); }
}

export async function createEntry(user: Session, input: any) {
  const col = getCollection(input.collection); if (!col) throw new Error("Unknown collection.");
  assertRole(user, col.key);
  const title = String(input.title || `Untitled ${col.singular.toLowerCase()}`).slice(0, 300);
  const slug = col.hasSlug ? await uniqueSlug(col.key, slugify(input.slug || title)) : "";
  if (col.key === "pages" && BUILTIN_SLUGS.includes(slug)) throw new Error("That address belongs to a built-in page.");
  const data = { ...(input.data || {}) }; if (col.key === "pages") { data.blocks = cleanBlocks(data.blocks); assertHtmlBlocks(user, data.blocks); }
  await applyAddress(col, data, slug);
  const status = input.status === "published" ? "published" : "draft";
  const [row] = await db().insert(E).values({ collection: col.key, title, slug, status, data, seo: input.seo || {}, sortOrder: Number(input.sortOrder) || 0, featured: !!input.featured, publishedAt: status === "published" ? new Date() : null }).returning();
  await audit(user.email, "create", `${col.singular}: ${title}`);
  bust();
  return row;
}

export async function updateEntry(user: Session, id: number, input: any) {
  const cur = await getEntry(id); if (!cur) throw new Error("Not found.");
  const col = getCollection(cur.collection)!;
  assertRole(user, col.key);
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
      assertHtmlBlocks(user, data.blocks, (cur.data.blocks || []) as any[]);
      if (cur.builtin) { // required parts cannot be deleted
        const req = ((cur.data.blocks || []) as Block[]).filter((b) => b.required);
        for (const r of req) if (!data.blocks.some((b: Block) => b.id === r.id)) data.blocks.push({ ...r, hidden: true });
      }
    }
    patch.data = data;
  }
  if (ROUTABLE.includes(col.key) && (patch.data !== undefined || patch.slug !== undefined)) {
    const nextData = { ...(patch.data ?? cur.data) }; await applyAddress(col, nextData, patch.slug ?? cur.slug, { id, builtin: cur.builtin }); patch.data = nextData;
  }
  if (input.seo !== undefined) patch.seo = input.seo;
  if (input.sortOrder !== undefined) patch.sortOrder = Number(input.sortOrder) || 0;
  if (input.featured !== undefined) patch.featured = !!input.featured;
  if (input.publishedAt) patch.publishedAt = new Date(input.publishedAt);
  const [row] = await db().update(E).set(patch).where(eq(E.id, id)).returning();
  if (col.key === "pages") await refreshChildren(id);
  // menu toggles from the page editor write into the one central navigation setting
  if (col.key === "pages" && input.menu) {
    const ident = await getSetting("identity");
    const nav = await getSetting("navigation");
    const path = entryUrl("pages", row.slug, row.data as any);
    let next = nav;
    if (cur.slug !== row.slug || entryUrl("pages", cur.slug, cur.data as any) !== path) { const old = entryUrl("pages", cur.slug, cur.data as any); next = setMenu(next, old, row.title, { header: false, footer: false }, ident.domain); }
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
    assertRole(user, col.key);
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
