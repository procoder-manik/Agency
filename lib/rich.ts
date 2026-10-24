/** Small, safe inline rich text (bold, italic, underline, line breaks and links with an optional colour).
 *  Used for the footer texts: the admin edits it like a document, the site shows only what this file allows. */
const SAFE_HREF = /^(https?:\/\/|\/|mailto:|tel:|#)/i;
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)|[a-z]{3,20})$/i;
export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unesc = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const colorOf = (attrs: string) => { const m = /style\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs); const c = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec((m?.[2] ?? m?.[3] ?? "")); const v = c?.[1]?.trim() || ""; return COLOR.test(v) ? v : ""; };

/** Keeps only the allowed tags and attributes. Everything else is removed (text is kept). */
export function sanitizeInline(html: string): string {
  const out = String(html || "").replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z][a-z0-9]*)((?:\s[^>]*)?)\/?>/gi, (m, name: string, attrs: string) => {
      const tag = name.toLowerCase(), close = m.startsWith("</");
      if (tag === "br") return "<br>";
      if (["b", "strong", "i", "em", "u"].includes(tag)) return close ? `</${tag}>` : `<${tag}>`;
      if (tag === "div" || tag === "p") return close ? "<br>" : "";
      if (tag === "span") { if (close) return "</span>"; const c = colorOf(attrs); return c ? `<span style="color:${c}">` : "<span>"; }
      if (tag === "a") {
        if (close) return "</a>";
        const h = /href\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs); const href = unesc((h?.[2] ?? h?.[3] ?? "").trim());
        if (!SAFE_HREF.test(href)) return "<a>";
        const c = colorOf(attrs); const ext = /^https?:\/\//i.test(href);
        return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}${c ? ` style="color:${c}"` : ""}>`;
      }
      return "";
    });
  // any "<" left over is plain text, never a tag
  return out.replace(/<(?!\/?(?:b|strong|i|em|u|br|a|span)\b)/gi, "&lt;").replace(/(?:<br>\s*)+$/i, "");
}

/** Older footer texts were plain text with [label](address) links. Turn those into the same HTML, and pass real HTML through. */
export function toRichHtml(text: string): string {
  const t = String(text || "");
  if (/<(a|b|strong|i|em|u|br|span|div|p)\b/i.test(t)) return t;
  return esc(t).replace(/\[([^\]]{1,120})\]\(([^)\s]{1,400})\)/g, (_m, label, href) => (SAFE_HREF.test(unesc(href)) ? `<a href="${href}">${label}</a>` : _m)).replace(/\n/g, "<br>");
}

/** {year} and {name} become the current year and the agency name; then the result is sanitised. */
export function richFooterHtml(text: string, name = ""): string {
  const replaced = toRichHtml(text).replace(/\{year\}/gi, String(new Date().getFullYear())).replace(/\{name\}/gi, esc(name));
  return sanitizeInline(replaced);
}
