import { safeFetchText } from "../ssrf";

const ENT: Record<string, string> = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&rsquo;": "'", "&lsquo;": "'", "&ldquo;": '"', "&rdquo;": '"', "&ndash;": "-", "&mdash;": "-", "&hellip;": "..." };
const decode = (s: string) => s.replace(/&(?:#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m) => ENT[m.toLowerCase()] ?? (/^&#(\d+);$/.test(m) ? String.fromCodePoint(Number(m.slice(2, -1))) : " "));

/** Page HTML to plain readable text: keeps the main content, drops menus, scripts and footers. */
export function htmlToText(html: string) {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ")).trim();
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html.match(/<body[\s\S]*<\/body>/i)?.[0] || html;
  const text = decode(main
    .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t\u00a0]+/g, " ").replace(/ *\n+ */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { title, text: text.slice(0, 20000) };
}

/** Download one page and return its title and text. Public http(s) pages only. */
export async function fetchSource(url: string) {
  const html = await safeFetchText(url, 600_000, true);
  const { title, text } = htmlToText(html);
  if (text.length < 80) throw new Error("The page has almost no readable text. It may need JavaScript to load, or be behind a login.");
  return { title: title || url, content: text };
}

/** Split long text into answer-sized pieces on paragraph and sentence boundaries. */
export function chunkText(text: string, size = 520) {
  const parts = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = []; let cur = "";
  for (const p of parts) {
    for (const piece of p.length > size ? p.split(/(?<=[.!?।])\s+/) : [p]) {
      if ((cur + " " + piece).length > size && cur) { out.push(cur); cur = piece; } else cur = cur ? cur + " " + piece : piece;
    }
  }
  if (cur) out.push(cur);
  return out.filter((c) => c.length > 30).slice(0, 60);
}
