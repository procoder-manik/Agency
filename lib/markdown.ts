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
