import { getAllSettings, siteUrl } from "./settings";
import { rateLimit } from "./ratelimit";
import { sendMail, smtpReady } from "./email";
import { buildNotification } from "./email-templates";

export interface PhoneResult { ok: boolean; channel: string; error?: string }

/** Sends one short text to the owner's own phone, through the provider chosen in Settings > Notifications. */
export async function sendPhone(text: string): Promise<PhoneResult> {
  const s = await getAllSettings(); const n = s.notify;
  const phone = String(n.phone || "").replace(/[^\d+]/g, "");
  if (n.channel === "off" || !phone) return { ok: false, channel: "off", error: "No phone channel is set up." };
  const body = text.slice(0, 900);
  try {
    if (n.channel === "callmebot") {
      if (!n.callmebotKey) return { ok: false, channel: "whatsapp", error: "Add your CallMeBot API key." };
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(n.callmebotKey)}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const t = await r.text().catch(() => "");
      if (!r.ok || /error|invalid|not activated/i.test(t.slice(0, 400))) return { ok: false, channel: "whatsapp", error: (t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || `HTTP ${r.status}`).slice(0, 200) };
      return { ok: true, channel: "whatsapp" };
    }
    if (n.channel === "twilio") {
      if (!n.twilioSid || !n.twilioToken || !n.twilioFrom) return { ok: false, channel: "twilio", error: "Add the Twilio SID, token and From number." };
      const wa = n.twilioMode !== "sms"; const pre = (v: string) => (wa ? "whatsapp:" : "") + v.replace(/^whatsapp:/, "");
      const form = new URLSearchParams({ To: pre(phone.startsWith("+") ? phone : "+" + phone), From: pre(n.twilioFrom.trim()), Body: body });
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(n.twilioSid)}/Messages.json`, { method: "POST", signal: AbortSignal.timeout(10000), headers: { authorization: "Basic " + Buffer.from(`${n.twilioSid}:${n.twilioToken}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" }, body: form });
      if (!r.ok) { const j: any = await r.json().catch(() => ({})); return { ok: false, channel: wa ? "whatsapp" : "sms", error: String(j.message || `HTTP ${r.status}`).slice(0, 200) }; }
      return { ok: true, channel: wa ? "whatsapp" : "sms" };
    }
  } catch (e: any) { return { ok: false, channel: n.channel, error: String(e?.message || "Request failed").slice(0, 200) }; }
  return { ok: false, channel: n.channel, error: "Unknown channel." };
}

/** Tells the owner that someone wants to talk: extra email addresses plus a message on the phone. Never throws. */
export async function notifyTeam(o: { kind: "chat" | "form"; title: string; rows: [string, string][]; replyTo?: string }) {
  try {
    const s = await getAllSettings(); const n = s.notify;
    if ((o.kind === "chat" && !n.chatRequests) || (o.kind === "form" && !n.formSubmissions)) return;
    if (!rateLimit("notify:all", 30, 60 * 60_000)) return; // protects your phone and any paid plan from floods
    const base = siteUrl(s.identity);
    const primary = (s.general.notifyEmail || s.identity.email || "").toLowerCase();
    const extra = Array.from(new Set(String(n.emails || "").split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) && x !== primary))).slice(0, 5);
    if (extra.length && smtpReady()) {
      const m = await buildNotification({ title: o.title, rows: o.rows, replyTo: o.replyTo });
      await Promise.all(extra.map((to) => sendMail(to, `${o.title} on ${s.identity.name}`, m.text, m.html, { replyTo: o.replyTo })));
    }
    if (n.channel !== "off") {
      const lines = [`${o.title} on ${s.identity.name}`, ...o.rows.map(([k, v]) => `${k}: ${String(v).replace(/\s+/g, " ").slice(0, 200)}`), `Open: ${base}/admin/leads`];
      await sendPhone(lines.join("\n"));
    }
  } catch (e) { console.error("[notify]", (e as Error).message); }
}
