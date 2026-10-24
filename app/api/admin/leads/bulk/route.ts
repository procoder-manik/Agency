export const dynamic = "force-dynamic";
import { inArray } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/lead-status";

const L = schema.leads;
/** Bulk actions from the Leads list: change status, verify, unsubscribe, delete. */
export const POST = api(async (req: Request) => {
  await requireApi();
  const b = await req.json();
  const ids: number[] = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n: number) => Number.isInteger(n) && n > 0).slice(0, 5000);
  if (!ids.length) throw new HttpError(400, "Select at least one lead.");
  if (b.action === "delete") { await db().update(L).set({ deletedAt: new Date() }).where(inArray(L.id, ids)); return { ok: true }; }
  const patch: any = { updatedAt: new Date() };
  if (b.status !== undefined) { if (!(LEAD_STATUSES as readonly string[]).includes(b.status)) throw new HttpError(400, "Unknown status."); patch.status = b.status; }
  if (typeof b.verified === "boolean") { patch.verified = b.verified; patch.verifiedAt = b.verified ? new Date() : null; }
  if (typeof b.unsubscribed === "boolean") patch.unsubscribed = b.unsubscribed;
  if (Object.keys(patch).length === 1) throw new HttpError(400, "Nothing to change.");
  await db().update(L).set(patch).where(inArray(L.id, ids));
  return { ok: true };
});
