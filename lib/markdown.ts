import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md: string) {
  const html = marked.parse(md || "", { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4", "figure", "figcaption", "video", "source"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height", "loading"], a: ["href", "title", "target", "rel"], video: ["src", "autoplay", "loop", "muted", "playsinline", "controls"], source: ["src", "type"], "*": ["id"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }) },
  });
}

export interface TocItem { id: string; text: string; level: 2 | 3 }

/** Renders markdown and returns the table of contents (h2 and h3). Headings get stable ids so links and scroll tracking work. */
export function renderMarkdownToc(md: string) {
  const raw = marked.parse(md || "", { async: false }) as string;
  const toc: TocItem[] = []; const used = new Map<string, number>();
  const withIds = raw.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
    let id = text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
    const n = used.get(id) || 0; used.set(id, n + 1); if (n) id = `${id}-${n + 1}`;
    toc.push({ id, text, level: Number(lvl) as 2 | 3 });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });
  const html = sanitizeHtml(withIds, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4", "figure", "figcaption", "video", "source"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height", "loading"], a: ["href", "title", "target", "rel"], video: ["src", "autoplay", "loop", "muted", "playsinline", "controls"], source: ["src", "type"], "*": ["id"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }) },
  });
  return { html, toc, words: (md || "").split(/\s+/).filter(Boolean).length };
}
