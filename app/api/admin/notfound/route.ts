export const dynamic = "force-dynamic";
import { desc, eq } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
const N = schema.notFoundLog;
export const GET = api(async () => { await requireApi(); return { items: await db().select().from(N).orderBy(desc(N.hits), desc(N.lastSeen)).limit(500) }; });
export const DELETE = api(async (req: Request) => { await requireApi(); const id = new URL(req.url).searchParams.get("id"); if (id === "all") await db().delete(N); else await db().delete(N).where(eq(N.id, Number(id))); return { ok: true }; });
