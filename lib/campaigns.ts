import { and, asc, eq, gt, inArray, isNull, ne, sql as dsql } from "drizzle-orm";
import { db, schema } from "./db";
import { fillVars, getBrand, stripUnsafe, toPlainText, TEMPLATE_VARS } from "./email-templates";
import { sendMail } from "./email";
import { getAllSettings } from "./settings";

const L = schema.leads;
export interface Audience { verifiedOnly?: boolean; statuses?: string[]; source?: string; ids?: number[] }

export function audienceWhere(a: Audience, afterId = 0) {
  const w = [isNull(L.deletedAt), ne(L.email, ""), eq(L.unsubscribed, false), gt(L.id, afterId)];
  if (a.verifiedOnly !== false) w.push(eq(L.verified, true));
  if (a.statuses?.length) w.push(inArray(L.status, a.statuses));
  if (a.ids?.length) w.push(inArray(L.id, a.ids));
  if (a.source) w.push(dsql`${L.source} ILIKE ${"%" + a.source + "%"}`);
  return and(...w);
}
export async function countAudience(a: Audience) {
  const [r] = await db().select({ n: dsql<number>`count(*)::int` }).from(L).where(audienceWhere(a)); return r.n;
}
export async function audienceStats() {
  const [r] = await db().select({
    total: dsql<number>`count(*) FILTER (WHERE ${L.email} <> '')::int`,
    verified: dsql<number>`count(*) FILTER (WHERE ${L.email} <> '' AND ${L.verified})::int`,
    unsub: dsql<number>`count(*) FILTER (WHERE ${L.unsubscribed})::int`,
  }).from(L).where(isNull(L.deletedAt));
  return r;
}

const FOOT_RX = /\{\{\s*unsubscribeUrl\s*\}\}/;
export function prepareHtml(html: string) {
  let h = stripUnsafe(html);
  if (!FOOT_RX.test(h)) { // every marketing email needs an unsubscribe link
    const foot = `<div style="max-width:600px;margin:16px auto 0;padding:0 16px 24px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#64748B">You are receiving this because you contacted {{siteName}}. <a href="{{unsubscribeUrl}}" style="color:#64748B">Unsubscribe</a></div>`;
    h = /<\/body>/i.test(h) ? h.replace(/<\/body>/i, foot + "</body>") : h + foot;
  }
  return h;
}

export async function varsFor(lead: { name: string; email: string; company: string; token: string }) {
  const b = await getBrand();
  const first = (lead.name || "").trim().split(/\s+/)[0] || "there";
  return { name: lead.name || "there", firstName: first, email: lead.email, company: lead.company || "", siteName: b.name, siteUrl: b.url, year: String(new Date().getFullYear()),
    unsubscribeUrl: `${b.url}/api/email/unsubscribe?t=${lead.token}`, verifyUrl: `${b.url}/api/email/verify?t=${lead.token}` } as Record<(typeof TEMPLATE_VARS)[number], string>;
}

export async function sendOne(c: { subject: string; html: string }, lead: { name: string; email: string; company: string; token: string }) {
  const [s, vars] = await Promise.all([getAllSettings(), varsFor(lead)]);
  const html = fillVars(prepareHtml(c.html), vars);
  const brand = await getBrand();
  return sendMail(lead.email, fillVars(c.subject, vars).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), toPlainText(html), html, {
    fromName: s.email.fromName || brand.name, replyTo: s.email.replyTo || brand.email,
    headers: { "List-Unsubscribe": `<${vars.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}

/** Sends the next batch of a campaign. Resumable: progress is stored as the last lead id handled. */
export async function sendBatch(id: number, size = 20) {
  const [c] = await db().select().from(schema.campaigns).where(and(eq(schema.campaigns.id, id), isNull(schema.campaigns.deletedAt))).limit(1);
  if (!c) throw new Error("Campaign not found.");
  if (c.status === "sent") return c;
  const aud = c.audience as Audience;
  if (c.status === "draft" || c.status === "paused") {
    const total = c.status === "draft" ? await countAudience(aud) : c.total;
    await db().update(schema.campaigns).set({ status: "sending", total, startedAt: c.startedAt || new Date(), updatedAt: new Date() }).where(eq(schema.campaigns.id, id));
  }
  const rows = await db().select().from(L).where(audienceWhere(aud, c.cursorId)).orderBy(asc(L.id)).limit(size);
  let sent = 0, failed = 0, cursor = c.cursorId;
  for (let i = 0; i < rows.length; i += 5) {
    const chunk = rows.slice(i, i + 5);
    const res = await Promise.all(chunk.map((r) => sendOne(c, r).catch(() => false)));
    res.forEach((ok) => (ok ? sent++ : failed++));
    cursor = chunk[chunk.length - 1].id;
  }
  const done = rows.length < size;
  const [out] = await db().update(schema.campaigns).set({
    sent: c.sent + sent, failed: c.failed + failed, cursorId: cursor, status: done ? "sent" : "sending", finishedAt: done ? new Date() : null, updatedAt: new Date(),
  }).where(eq(schema.campaigns.id, id)).returning();
  return out;
}
