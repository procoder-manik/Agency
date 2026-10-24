export const dynamic = "force-dynamic";
import sharp from "sharp";
import { and, desc, eq, ilike, isNull, or, sql as dsql } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audit } from "@/lib/content";

const M = schema.media;
const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg", "video/mp4": "mp4", "video/webm": "webm", "application/json": "json" };
const MAX = 10 * 1024 * 1024;

/** Magic-byte check so the declared type matches the file content. */
function sniff(buf: Buffer, mime: string) {
  const h = buf.subarray(0, 16).toString("hex");
  if (mime === "image/jpeg") return h.startsWith("ffd8ff");
  if (mime === "image/png") return h.startsWith("89504e47");
  if (mime === "image/gif") return h.startsWith("47494638");
  if (mime === "image/webp") return h.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP";
  if (mime === "image/avif") return buf.subarray(4, 12).toString().startsWith("ftyp");
  if (mime === "video/mp4") return buf.subarray(4, 8).toString() === "ftyp";
  if (mime === "video/webm") return h.startsWith("1a45dfa3");
  if (mime === "application/json") { try { const j = JSON.parse(buf.toString("utf8")); return !!(j && (j.layers || j.assets)); } catch { return false; } }
  if (mime === "image/svg+xml") { const t = buf.toString("utf8"); return /<svg[\s>]/i.test(t) && !/<script|on\w+\s*=|javascript:/i.test(t); }
  return false;
}

export const GET = api(async (req: Request) => {
  await requireApi();
  const q = new URL(req.url).searchParams.get("q") || "";
  const rows = await db().select({ id: M.id, filename: M.filename, mime: M.mime, size: M.size, width: M.width, height: M.height, alt: M.alt, createdAt: M.createdAt })
    .from(M).where(and(isNull(M.deletedAt), q ? or(ilike(M.filename, `%${q}%`), ilike(M.alt, `%${q}%`)) : dsql`true`)).orderBy(desc(M.createdAt)).limit(500);
  return { items: rows.map((r) => ({ ...r, url: `/media/${r.id}/${encodeURIComponent(r.filename)}` })) };
});

export const POST = api(async (req: Request) => {
  const u = await requireApi();
  const fd = await req.formData();
  const out = [];
  for (const f of fd.getAll("file")) {
    if (!(f instanceof File)) continue;
    if (f.size > MAX) throw new Error(`${f.name} is larger than 10 MB.`);
    let mime = f.type || ""; if (f.name.endsWith(".json")) mime = "application/json";
    if (!ALLOWED[mime]) throw new Error(`${f.name}: this file type isn't allowed. Use JPG, PNG, WebP, GIF, AVIF, SVG, MP4, WebM or Lottie JSON.`);
    let buf: Buffer = Buffer.from(await f.arrayBuffer());
    if (!sniff(buf, mime)) throw new Error(`${f.name}: the file content doesn't match its type.`);
    let width: number | null = null, height: number | null = null;
    let name = f.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    if (["image/jpeg", "image/png"].includes(mime)) { // optimise to WebP, max 2400px
      // Very tall images (full-page website screenshots) are limited by width only, so they stay readable.
      // WebP cannot be taller than 16383 px, so the height is capped just under that.
      const meta0 = await sharp(buf).metadata();
      const tall = (meta0.height || 0) > (meta0.width || 1) * 2.2;
      const img = tall ? sharp(buf).rotate().resize({ width: 1600, height: 16000, fit: "inside", withoutEnlargement: true })
        : sharp(buf).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
      buf = await img.webp({ quality: 82 }).toBuffer(); mime = "image/webp"; name = name.replace(/\.\w+$/, "") + ".webp";
    }
    if (mime.startsWith("image/") && mime !== "image/svg+xml") { try { const m = await sharp(buf, { animated: mime === "image/gif" }).metadata(); width = m.width ?? null; height = (m.pageHeight || m.height) ?? null; } catch {} }
    const alt = String(fd.get("alt") || "").slice(0, 300);
    const [row] = await db().insert(M).values({ filename: name, mime, size: buf.length, width, height, alt, data: buf }).returning({ id: M.id });
    out.push({ id: row.id, url: `/media/${row.id}/${encodeURIComponent(name)}`, filename: name, mime, width, height, alt });
  }
  await audit(u.email, "upload media", `${out.length} file(s)`);
  return { items: out };
});

export const PUT = api(async (req: Request) => {
  await requireApi();
  const { id, alt } = await req.json();
  await db().update(M).set({ alt: String(alt || "").slice(0, 300), updatedAt: new Date() }).where(eq(M.id, Number(id)));
  return { ok: true };
});

export const DELETE = api(async (req: Request) => {
  const u = await requireApi();
  const id = Number(new URL(req.url).searchParams.get("id"));
  await db().update(M).set({ deletedAt: new Date() }).where(eq(M.id, id));
  await audit(u.email, "trash media", `#${id}`);
  return { ok: true };
});
