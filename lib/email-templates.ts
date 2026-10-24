import { getAllSettings, siteUrl } from "./settings";
import { getActiveTheme } from "./theme-server";
import { paletteFor } from "./themes";
import { esc } from "./email";
import { renderMustache } from "./mustache";

export interface Brand { name: string; url: string; accent: string; accent2: string; logo: string; email: string; replyTime: string; address: string }

/** Brand colours and identity for emails, taken from the active theme (light palette) unless overridden in Settings > Email. */
export async function getBrand(): Promise<Brand> {
  const [s, theme] = await Promise.all([getAllSettings(), getActiveTheme()]);
  const pal = paletteFor(theme.tokens, "light");
  const url = siteUrl(s.identity);
  const logo = s.identity.logo ? (/^https?:\/\//.test(s.identity.logo) ? s.identity.logo : url + (s.identity.logo.startsWith("/") ? "" : "/") + s.identity.logo) : "";
  const custom = /^#[0-9a-f]{6}$/i.test(s.email.brandColor || "") ? s.email.brandColor : "";
  return { name: s.identity.name, url, accent: custom || pal.accent, accent2: pal.accent2, logo, email: s.identity.email, replyTime: s.identity.replyTime, address: s.identity.address };
}

export const TEMPLATE_VARS = ["name", "firstName", "email", "company", "siteName", "siteUrl", "year", "unsubscribeUrl", "verifyUrl"] as const;

export function fillVars(html: string, vars: Record<string, string>) {
  return renderMustache(html, vars);
}

const textOnly = (h: string) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h\d|tr|li)>/gi, "\n").replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n{3,}/g, "\n\n").trim();
export const toPlainText = textOnly;

export const stripUnsafe = (html: string) => String(html || "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "").replace(/javascript:/gi, "");

/** Table-based, inline-styled layout that renders the same in Gmail, Outlook and Apple Mail. */
export function emailShell(o: { brand: Brand; preheader?: string; heading?: string; bodyHtml: string; cta?: { label: string; href: string }; footerHtml?: string }) {
  const b = o.brand;
  const head = b.logo
    ? `<img src="${esc(b.logo)}" alt="${esc(b.name)}" height="36" style="display:block;border:0;height:36px;max-width:200px">`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#0F172A;letter-spacing:-0.3px">${esc(b.name)}</span>`;
  const cta = o.cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="border-radius:10px;background:${b.accent}"><a href="${esc(o.cta.href)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px">${esc(o.cta.label)}</a></td></tr></table>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(o.heading || b.name)}</title></head>
<body style="margin:0;padding:0;background:#F1F5F9">
${o.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0">
<tr><td style="height:5px;background:${b.accent};background-image:linear-gradient(90deg,${b.accent},${b.accent2});font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 36px 0">${head}</td></tr>
<tr><td style="padding:24px 36px 36px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#334155">
${o.heading ? `<h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;color:#0F172A;letter-spacing:-0.4px">${esc(o.heading)}</h1>` : ""}
${o.bodyHtml}${cta}
</td></tr>
<tr><td style="padding:20px 36px 28px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.6;color:#64748B">
${o.footerHtml || `<strong style="color:#334155">${esc(b.name)}</strong><br><a href="${esc(b.url)}" style="color:${b.accent};text-decoration:none">${esc(b.url.replace(/^https?:\/\//, ""))}</a>`}
</td></tr></table></td></tr></table></body></html>`;
}

const p = (t: string) => `<p style="margin:0 0 16px">${t}</p>`;

/** Confirmation email sent automatically after a form or chat submission. */
export async function buildAutoReply(o: { name: string; email: string; formTitle: string; summary: [string, string][]; verifyUrl?: string; unsubscribeUrl: string; customMessage?: string }) {
  const [s, brand] = await Promise.all([getAllSettings(), getBrand()]);
  const e = s.email;
  const vars = { name: o.name, firstName: (o.name || "").trim().split(/\s+/)[0] || "there", email: o.email, siteName: brand.name, replyTime: brand.replyTime || "soon", siteUrl: brand.url, formTitle: o.formTitle };
  const f = (t: string) => String(t || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars as Record<string, string>)[k] ?? "");
  const rows = e.showSummary && o.summary.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px"><tr><td style="padding:16px 18px"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748B;margin-bottom:10px">Your message</div>${o.summary.map(([k, v]) => `<div style="margin:0 0 8px"><span style="color:#64748B;font-size:13px">${esc(k)}</span><br><span style="color:#0F172A">${esc(v).replace(/\n/g, "<br>")}</span></div>`).join("")}</td></tr></table>` : "";
  const note = o.verifyUrl ? p(`Please confirm your email address so we can keep you updated with news and offers:`) : "";
  const body = p(esc(f(o.customMessage || e.intro))) + (e.body ? p(esc(f(e.body))) : "") + rows + note + p(`${esc(f(e.signature))}`);
  const footer = `<strong style="color:#334155">${esc(brand.name)}</strong>${brand.address ? `<br>${esc(brand.address)}` : ""}<br><a href="${esc(brand.url)}" style="color:${brand.accent};text-decoration:none">${esc(brand.url.replace(/^https?:\/\//, ""))}</a>`
    + `<br><br>${esc(f(e.unsubscribeNote))}${e.footerNote ? `<br>${esc(f(e.footerNote))}` : ""}<br><a href="${esc(o.unsubscribeUrl)}" style="color:#64748B">Unsubscribe from emails</a>`;
  const html = emailShell({ brand, preheader: f(e.intro).slice(0, 120), heading: f(e.heading), bodyHtml: body, cta: o.verifyUrl ? { label: "Confirm my email", href: o.verifyUrl } : undefined, footerHtml: footer });
  return { subject: f(e.subject), html, text: toPlainText(html), fromName: e.fromName || brand.name, replyTo: e.replyTo || brand.email };
}

/** Internal notification sent to the team (same look, more compact). */
export async function buildNotification(o: { title: string; rows: [string, string][]; replyTo?: string; extraHtml?: string }) {
  const brand = await getBrand();
  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${o.rows.map(([k, v]) => `<tr><td valign="top" style="padding:10px 14px 10px 0;width:130px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#64748B;text-transform:capitalize">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;color:#0F172A">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;
  const html = emailShell({ brand, heading: o.title, bodyHtml: table + (o.extraHtml || ""), cta: o.replyTo ? { label: "Reply to " + o.replyTo, href: "mailto:" + o.replyTo } : undefined, footerHtml: `Sent from the website of <strong style="color:#334155">${esc(brand.name)}</strong>.` });
  return { html, text: o.rows.map(([k, v]) => `${k}: ${v}`).join("\n") };
}

/** Ready-made campaign layouts. Variables like {{firstName}} are filled per recipient when sending. */
export function starterTemplates(b: Brand): { name: string; subject: string; preheader: string; html: string }[] {
  const foot = `<strong style="color:#334155">{{siteName}}</strong><br><a href="{{siteUrl}}" style="color:${b.accent};text-decoration:none">{{siteUrl}}</a><br><br>You are receiving this because you contacted {{siteName}}.<br><a href="{{unsubscribeUrl}}" style="color:#64748B">Unsubscribe</a>`;
  const mk = (heading: string, body: string, cta?: { label: string; href: string }, pre?: string) => emailShell({ brand: { ...b, name: "{{siteName}}", url: "{{siteUrl}}" }, preheader: pre, heading, bodyHtml: body, cta, footerHtml: foot });
  return [
    { name: "Special offer", subject: "A special offer for you, {{firstName}}", preheader: "A limited-time offer from {{siteName}}",
      html: mk("A special offer for you, {{firstName}}", p("We are running a limited offer for our clients and contacts, and we wanted you to hear about it first.") + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px"><tr><td style="padding:20px 22px"><div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${b.accent}">Limited time</div><div style="font-size:22px;font-weight:700;color:#0F172A;margin:6px 0">Write your offer headline here</div><div style="color:#475569">Describe the offer, what is included and when it ends.</div></td></tr></table>` + p("Reply to this email or use the button below and we will set it up for you."), { label: "Claim the offer", href: "{{siteUrl}}/contact" }, "A limited-time offer from {{siteName}}") },
    { name: "Newsletter", subject: "News from {{siteName}}", preheader: "What we have been working on",
      html: mk("What we have been working on", p("Hi {{firstName}},") + p("Here is a short update from the team.") + `<h2 style="margin:24px 0 8px;font-size:19px;color:#0F172A">First story title</h2>` + p("Two or three sentences about the first story.") + `<h2 style="margin:24px 0 8px;font-size:19px;color:#0F172A">Second story title</h2>` + p("Two or three sentences about the second story."), { label: "Read more on our blog", href: "{{siteUrl}}/blog" }) },
    { name: "Personal note", subject: "Quick note from {{siteName}}", preheader: "",
      html: mk("", p("Hi {{firstName}},") + p("Write a short, personal message here. Keep it plain and friendly. Mention what they asked about when they contacted us.") + p("Best regards,<br>The {{siteName}} team")) },
  ];
}
