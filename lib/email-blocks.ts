/** Visual email builder model and renderer. Pure functions, no server imports, so the admin can render a live preview
 *  and the generated HTML is what gets stored and sent. Dynamic fields such as {{firstName}} are filled per recipient. */

export type Align = "left" | "center" | "right";
export interface CardItem { title: string; text: string; price?: string; image?: string; href?: string; cta?: string }
export type EBlock =
  | { id: string; type: "heading"; text: string; align: Align; size: "s" | "m" | "l" }
  | { id: string; type: "text"; html: string; align: Align }
  | { id: string; type: "image"; src: string; alt: string; href?: string; width: 100 | 75 | 50; align: Align }
  | { id: string; type: "button"; label: string; href: string; align: Align; style: "solid" | "outline" }
  | { id: string; type: "cards"; source: "services" | "packages" | "posts" | "custom"; columns: 1 | 2 | 3; items: CardItem[] }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; height: number }
  | { id: string; type: "html"; html: string };

export interface EmailSettings { bg: string; card: string; text: string; accent: string; showLogo: boolean; footer: string }
export interface EmailDoc { v: 1; settings: EmailSettings; blocks: EBlock[] }
export interface EmailBrand { name: string; logo: string; accent: string }

export const uid = () => Math.random().toString(36).slice(2, 9);
export const defaultSettings = (accent = "#1E5CF2"): EmailSettings => ({ bg: "#F1F5F9", card: "#FFFFFF", text: "#334155", accent, showLogo: true, footer: "" });

export const BLOCK_TYPES: { type: EBlock["type"]; label: string; hint: string }[] = [
  { type: "heading", label: "Heading", hint: "A title" }, { type: "text", label: "Text", hint: "Paragraphs, bold, links, lists" },
  { type: "image", label: "Image", hint: "From your media library" }, { type: "button", label: "Button", hint: "A call to action" },
  { type: "cards", label: "Cards", hint: "Services, pricing or posts" }, { type: "divider", label: "Divider", hint: "A thin line" },
  { type: "spacer", label: "Spacer", hint: "Empty space" }, { type: "html", label: "Custom HTML", hint: "Your own code" },
];

export function newBlock(type: EBlock["type"]): EBlock {
  const id = uid();
  switch (type) {
    case "heading": return { id, type, text: "Your headline here", align: "left", size: "m" };
    case "text": return { id, type, html: "Hi {{firstName}},<br><br>Write your message here.", align: "left" };
    case "image": return { id, type, src: "", alt: "", width: 100, align: "center" };
    case "button": return { id, type, label: "Learn more", href: "/contact", align: "left", style: "solid" };
    case "cards": return { id, type, source: "services", columns: 2, items: [] };
    case "divider": return { id, type };
    case "spacer": return { id, type, height: 24 };
    default: return { id, type: "html", html: "<p>Your HTML</p>" };
  }
}

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
/** Relative links and images become absolute at send time ({{siteUrl}} is filled per message). */
export const abs = (u?: string) => { const v = String(u || "").trim(); if (!v) return ""; return /^\/(?!\/)/.test(v) ? "{{siteUrl}}" + v : v; };
const safeHref = (u?: string) => { const a = abs(u); return /^(https?:|mailto:|tel:|#|\{\{)/i.test(a) ? a : a ? "{{siteUrl}}/" + a.replace(/^\/+/, "") : "#"; };

export function cleanRich(html: string) {
  return String(html || "")
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "").replace(/javascript:/gi, "")
    .replace(/<div[^>]*>/gi, '<p style="margin:0 0 14px">').replace(/<\/div>/gi, "</p>")
    .replace(/<p>/gi, '<p style="margin:0 0 14px">').replace(/<ul>/gi, '<ul style="margin:0 0 14px;padding-left:22px">').replace(/<ol>/gi, '<ol style="margin:0 0 14px;padding-left:22px">')
    .replace(/<a /gi, `<a style="color:var(--ea);text-decoration:underline" `);
}

function btn(label: string, href: string, accent: string, style: "solid" | "outline") {
  const solid = style === "solid";
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${solid ? accent : "transparent"};border:2px solid ${accent}"><a href="${esc(safeHref(href))}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${solid ? "#FFFFFF" : accent};text-decoration:none;border-radius:10px">${esc(label)}</a></td></tr></table>`;
}

function renderBlock(b: EBlock, s: EmailSettings): string {
  const row = (inner: string, pad = "0 36px 18px", align?: string) => `<tr><td${align ? ` align="${align}"` : ""} style="padding:${pad}">${inner}</td></tr>`;
  switch (b.type) {
    case "heading": { const fs = { s: 20, m: 26, l: 34 }[b.size] || 26; return row(`<h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;line-height:1.25;color:#0F172A;letter-spacing:-0.4px;text-align:${b.align}">${esc(b.text)}</h1>`); }
    case "text": return row(`<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:${s.text};text-align:${b.align}">${cleanRich(b.html).replace(/var\(--ea\)/g, s.accent)}</div>`);
    case "image": {
      if (!b.src) return "";
      const img = `<img src="${esc(abs(b.src))}" alt="${esc(b.alt)}" width="${Math.round(528 * (b.width / 100))}" style="display:block;border:0;width:${b.width}%;max-width:100%;height:auto;border-radius:12px;margin:${b.align === "center" ? "0 auto" : b.align === "right" ? "0 0 0 auto" : "0"}">`;
      return row(b.href ? `<a href="${esc(safeHref(b.href))}">${img}</a>` : img);
    }
    case "button": return row(btn(b.label, b.href, s.accent, b.style), "4px 36px 22px", b.align);
    case "divider": return row(`<div style="height:1px;background:#E2E8F0;font-size:0;line-height:0">&nbsp;</div>`, "6px 36px 22px");
    case "spacer": return `<tr><td style="height:${Math.max(4, Math.min(120, b.height))}px;font-size:0;line-height:0">&nbsp;</td></tr>`;
    case "html": return row(cleanRich(b.html).replace(/var\(--ea\)/g, s.accent));
    case "cards": {
      const items = b.items.filter((i) => i.title || i.text); if (!items.length) return "";
      const n = b.columns; const rows: CardItem[][] = []; for (let i = 0; i < items.length; i += n) rows.push(items.slice(i, i + n));
      const w = Math.floor(100 / n);
      const cell = (it: CardItem | undefined) => it ? `<td class="col" valign="top" width="${w}%" style="padding:6px;width:${w}%"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;background:#FFFFFF"><tr><td>
${it.image ? `<img src="${esc(abs(it.image))}" alt="${esc(it.title)}" width="100%" style="display:block;width:100%;height:auto;border:0">` : ""}
<div style="padding:16px 16px 18px;font-family:Arial,Helvetica,sans-serif"><div style="font-size:17px;font-weight:700;color:#0F172A;line-height:1.3">${esc(it.title)}</div>${it.price ? `<div style="margin-top:6px;font-size:16px;font-weight:700;color:${s.accent}">${esc(it.price)}</div>` : ""}${it.text ? `<div style="margin-top:8px;font-size:14px;line-height:1.55;color:#475569">${esc(it.text)}</div>` : ""}${it.href ? `<div style="margin-top:14px"><a href="${esc(safeHref(it.href))}" style="font-size:14px;font-weight:700;color:${s.accent};text-decoration:none">${esc(it.cta || "Learn more")} &rarr;</a></div>` : ""}</div></td></tr></table></td>` : `<td class="col" width="${w}%"></td>`;
      return row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 -6px;width:calc(100% + 12px)">${rows.map((r) => `<tr>${Array.from({ length: n }, (_, i) => cell(r[i])).join("")}</tr>`).join("")}</table>`, "0 30px 18px");
    }
  }
}

/** Full HTML document. `brand.logo` may be relative; it is made absolute with {{siteUrl}}. */
export function renderEmail(doc: EmailDoc, brand: EmailBrand, preheader = ""): string {
  const s = doc.settings;
  const logo = s.showLogo ? (brand.logo ? `<img src="${esc(abs(brand.logo))}" alt="${esc(brand.name)}" height="36" style="display:block;border:0;height:36px;max-width:200px">` : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#0F172A">${esc(brand.name)}</span>`) : "";
  const foot = s.footer ? `${esc(s.footer).replace(/\n/g, "<br>")}<br><br>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(brand.name)}</title>
<style>@media only screen and (max-width:520px){.col{display:block!important;width:100%!important}}</style></head>
<body style="margin:0;padding:0;background:${s.bg}">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${s.bg}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${s.card};border-radius:16px;overflow:hidden;border:1px solid #E2E8F0">
<tr><td style="height:5px;background:${s.accent};font-size:0;line-height:0">&nbsp;</td></tr>
${logo ? `<tr><td style="padding:28px 36px 18px">${logo}</td></tr>` : `<tr><td style="height:24px;font-size:0;line-height:0">&nbsp;</td></tr>`}
${doc.blocks.map((b) => renderBlock(b, s)).join("\n")}
<tr><td style="height:12px;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:20px 36px 26px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.6;color:#64748B">${foot}<strong style="color:#334155">{{siteName}}</strong> &middot; <a href="{{siteUrl}}" style="color:${s.accent};text-decoration:none">{{siteUrl}}</a><br>You are receiving this because you contacted {{siteName}}. <a href="{{unsubscribeUrl}}" style="color:#64748B">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`;
}

/** Ready-made layouts as editable block documents. */
export function starterDocs(accent: string): { name: string; subject: string; preheader: string; doc: EmailDoc }[] {
  const mk = (blocks: EBlock[]): EmailDoc => ({ v: 1, settings: defaultSettings(accent), blocks });
  const B = (b: Partial<EBlock> & { type: EBlock["type"] }) => ({ ...newBlock(b.type), ...b }) as EBlock;
  return [
    { name: "Special offer", subject: "A special offer for you, {{firstName}}", preheader: "A limited-time offer from {{siteName}}", doc: mk([
      B({ type: "heading", text: "A special offer for you, {{firstName}}", size: "l" }),
      B({ type: "text", html: "We are running a limited offer for our clients and contacts, and we wanted you to hear about it first.<br><br><b>Write the offer here:</b> what is included, who it is for and when it ends." }),
      B({ type: "cards", source: "packages", columns: 2, items: [] }),
      B({ type: "button", label: "Claim the offer", href: "/contact" }),
    ]) },
    { name: "Newsletter", subject: "News from {{siteName}}", preheader: "What we have been working on", doc: mk([
      B({ type: "heading", text: "What we have been working on", size: "l" }),
      B({ type: "text", html: "Hi {{firstName}},<br><br>Here is a short update from the team." }),
      B({ type: "divider" }),
      B({ type: "cards", source: "posts", columns: 2, items: [] }),
      B({ type: "button", label: "Read more on our blog", href: "/blog" }),
    ]) },
    { name: "Our services", subject: "How we can help, {{firstName}}", preheader: "A quick look at what we do", doc: mk([
      B({ type: "heading", text: "How we can help", size: "l" }),
      B({ type: "text", html: "Hi {{firstName}},<br><br>A quick look at the services we offer." }),
      B({ type: "cards", source: "services", columns: 2, items: [] }),
      B({ type: "button", label: "Talk to us", href: "/contact" }),
    ]) },
    { name: "Personal note", subject: "Quick note from {{siteName}}", preheader: "", doc: mk([
      B({ type: "text", html: "Hi {{firstName}},<br><br>Write a short, personal message here. Keep it plain and friendly.<br><br>Best regards,<br>The {{siteName}} team" }),
    ]) },
  ];
}
