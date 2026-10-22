export const dynamic = "force-dynamic";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const [m] = await db().select().from(schema.media).where(and(eq(schema.media.id, id), isNull(schema.media.deletedAt))).limit(1);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(m.data), { headers: { "content-type": m.mime, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", ...(m.mime === "image/svg+xml" ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}) } });
}
