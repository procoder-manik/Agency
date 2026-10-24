import { getAllSettings } from "./settings";
import { rateLimit } from "./ratelimit";
import { buildAutoReply, getBrand } from "./email-templates";
import { sendMail, smtpReady } from "./email";
import { EMAIL_RX } from "./leads";

type Lead = { email: string; token: string; verified: boolean; unsubscribed: boolean };

/** Sends the branded "we received your message" email to the person who submitted a form or chat lead.
 *  Never throws: a mail problem must not block the submission. */
export async function sendAutoReply(o: { lead: Lead; name: string; formTitle: string; summary: [string, string][]; kind: "form" | "chat"; customMessage?: string }) {
  try {
    const s = await getAllSettings();
    if (!s.email.autoReply || (o.kind === "chat" && !s.email.chatAutoReply)) return false;
    if (!smtpReady() || !EMAIL_RX.test(o.lead.email) || o.lead.unsubscribed) return false;
    if (!rateLimit("autoreply:" + o.lead.email.toLowerCase(), 2, 60 * 60_000)) return false; // stops anyone using the form to mail-bomb an address
    const brand = await getBrand();
    const unsubscribeUrl = `${brand.url}/api/email/unsubscribe?t=${o.lead.token}`;
    const verifyUrl = s.email.verifyEmail && !o.lead.verified ? `${brand.url}/api/email/verify?t=${o.lead.token}` : undefined;
    const m = await buildAutoReply({ name: o.name, email: o.lead.email, formTitle: o.formTitle, summary: o.summary, verifyUrl, unsubscribeUrl, customMessage: o.customMessage });
    return await sendMail(o.lead.email, m.subject, m.text, m.html, { fromName: m.fromName, replyTo: m.replyTo, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "Auto-Submitted": "auto-replied" } });
  } catch (e) { console.error("[autoreply]", (e as Error).message); return false; }
}
