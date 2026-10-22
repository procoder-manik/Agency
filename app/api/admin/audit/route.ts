export const dynamic = "force-dynamic";
import { desc } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
export const GET = api(async () => { await requireApi("admin"); return { items: await db().select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(500), ai: await db().select().from(schema.aiLog).orderBy(desc(schema.aiLog.createdAt)).limit(200) }; });
