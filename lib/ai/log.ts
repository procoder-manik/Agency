import { db, schema } from "../db";
export async function logAi(email: string, task: string, provider = "", model = "", summary = "", ok = true) {
  try { await db().insert(schema.aiLog).values({ userEmail: email, task, provider, model, summary: summary.slice(0, 300), ok }); } catch {}
}
