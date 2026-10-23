/** Tiny logic-less template engine for custom modules.
 *  {{name}} escaped, {{{name}}} raw (use for markdown fields), {{#each list}}..{{this}}..{{/each}}, {{#if name}}..{{else}}..{{/if}}.
 *  Sections of the same kind cannot be nested. */
export const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const get = (ctx: any, path: string) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), ctx);
const truthy = (v: any) => (Array.isArray(v) ? v.length > 0 : !!v && v !== "0");

export function renderMustache(tpl: string, ctx: Record<string, any>, depth = 0): string {
  if (depth > 6) return "";
  let out = String(tpl || "");
  out = out.replace(/\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, k, inner) => {
    const list = get(ctx, k); if (!Array.isArray(list)) return "";
    return list.map((item, i) => renderMustache(inner, { ...ctx, ...(item && typeof item === "object" ? item : {}), this: item, "@index": i + 1 }, depth + 1)).join("");
  });
  out = out.replace(/\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g, (_, k, a, b) => renderMustache(truthy(get(ctx, k)) ? a : b || "", ctx, depth + 1));
  out = out.replace(/\{\{\{\s*([\w.@]+)\s*\}\}\}/g, (_, k) => String(get(ctx, k) ?? ""));
  out = out.replace(/\{\{\s*([\w.@]+)\s*\}\}/g, (_, k) => esc(get(ctx, k) ?? ""));
  return out;
}

/** Prefix every selector so a module's CSS can't leak into the rest of the page. */
export function scopeCss(css: string, scope: string): string {
  const src0 = String(css || "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/@import[^;]+;/gi, "").replace(/<\/style/gi, "");
  const parse = (src: string): string => {
    let res = "", pos = 0;
    while (pos < src.length) {
      const open = src.indexOf("{", pos); if (open < 0) break;
      const head = src.slice(pos, open).trim(); let depth = 1, j = open + 1;
      while (j < src.length && depth > 0) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
      const body = src.slice(open + 1, j - 1);
      if (/^@(media|supports|container)/i.test(head)) res += `${head}{${parse(body)}}`;
      else if (head.startsWith("@")) res += `${head}{${body}}`;
      else res += head.split(",").map((s) => { s = s.trim(); if (!s) return ""; if (/^(html|body|:root|:scope)$/i.test(s)) return scope; return `${scope} ${s.replace(/^:scope\s*/, "")}`; }).filter(Boolean).join(",") + `{${body}}`;
      pos = j;
    }
    return res;
  };
  return parse(src0);
}
