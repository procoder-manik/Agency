import { randomBytes } from "node:crypto";
import { and, eq, isNull, sql as dsql } from "drizzle-orm";
import { db, schema } from "./db";

export const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const L = schema.leads;
export const newToken = () => randomBytes(24).toString("hex");

export interface LeadInput { name?: string; email?: string; phone?: string; company?: string; source: string; notes?: string; submissionId?: number | null }

const stamp = (source: string) => `[${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${source}]`;

/** One lead per email address. A repeat enquiry updates the existing lead (counter, notes, missing details)
 *  instead of creating a duplicate. Returns whether the lead is new and the stored row. */
export async function captureLead(i: LeadInput) {
  const email = (i.email || "").trim().toLowerCase();
  const base = { name: (i.name || "").trim(), phone: (i.phone || "").trim(), company: (i.company || "").trim(), notes: (i.notes || "").trim() };
  if (!email) {
    const [row] = await db().insert(L).values({ ...base, email: "", source: i.source, submissionId: i.submissionId ?? null, token: newToken(), lastContactAt: new Date() }).returning();
    return { lead: row, isNew: true, previousContactAt: null as Date | null };
  }
  const existing = async () => (await db().select().from(L).where(and(dsql`lower(${L.email}) = ${email}`, isNull(L.deletedAt))).limit(1))[0];
  const update = async (cur: typeof L.$inferSelect) => {
    const joined = [cur.notes, base.notes ? `${stamp(i.source)}\n${base.notes}` : ""].filter(Boolean).join("\n\n---\n\n").slice(0, 20000);
    const [row] = await db().update(L).set({
      name: cur.name || base.name, phone: cur.phone || base.phone, company: cur.company || base.company, notes: joined,
      contactCount: cur.contactCount + 1, lastContactAt: new Date(), token: cur.token || newToken(), updatedAt: new Date(),
    }).where(eq(L.id, cur.id)).returning();
    return { lead: row, isNew: false, previousContactAt: cur.lastContactAt };
  };
  const cur = await existing();
  if (cur) return update(cur);
  try {
    const [row] = await db().insert(L).values({ ...base, email, source: i.source, submissionId: i.submissionId ?? null, token: newToken(), lastContactAt: new Date() }).returning();
    return { lead: row, isNew: true, previousContactAt: null as Date | null };
  } catch (e: any) {
    if (e?.code === "23505" || /leads_email_uniq|duplicate key/i.test(e?.message || "")) { const again = await existing(); if (again) return update(again); }
    throw e;
  }
}
