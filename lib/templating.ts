/** Pure helpers shared by the location generator, section presets and the content pack. No server-only imports. */
import { slugify } from "./util";

export function hash(s: string) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; }
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export function pluralize(w: string) {
  const s = w.trim(); if (!s) return s;
  if (/(s|x|z|ch|sh)$/i.test(s)) return s + "es";
  if (/[^aeiou]y$/i.test(s)) return s.slice(0, -1) + "ies";
  return s + "s";
}

export interface LocVars { service: string; industry?: string; industries?: string; location: string; city: string; state?: string; agency?: string; facts?: string }

export function varMap(v: LocVars): Record<string, string> {
  const industry = (v.industry || "").trim(); const industries = (v.industries || (industry ? pluralize(industry) : "")).trim();
  return { service: v.service, Service: cap(v.service), industry, Industry: cap(industry), industries, Industries: cap(industries), location: v.location, city: v.city, state: v.state || "", agency: v.agency || "", facts: v.facts || "" };
}

/** Replace {{variables}}, then pick one option from {a|b|c} groups. The pick is stable per page (seeded), so every location page reads a little differently. */
export function fill(str: string, map: Record<string, string>, seed: string) {
  let n = 0;
  const s = str.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, k) => map[k] ?? "");
  return s.replace(/\{([^{}|]+(?:\|[^{}|]+)+)\}/g, (_, g: string) => { const o = g.split("|"); return o[hash(`${seed}:${n++}`) % o.length].trim(); });
}
export function fillDeep<T>(v: T, map: Record<string, string>, seed: string, skip = new Set(["id", "type", "href", "primaryHref", "secondaryHref", "linkHref", "service", "form", "module"])): T {
  if (typeof v === "string") return fill(v, map, seed) as any;
  if (Array.isArray(v)) return v.map((x) => fillDeep(x, map, seed, skip)) as any;
  if (v && typeof v === "object") { const o: any = {}; for (const k of Object.keys(v as any)) o[k] = skip.has(k) ? (v as any)[k] : fillDeep((v as any)[k], map, seed, skip); return o; }
  return v;
}

/** Parse "Houston, TX | optional local facts" lines. */
export function parseLocations(text: string) {
  return text.split(/\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [place, facts = ""] = line.split("|").map((x) => x.trim());
    const [city, ...rest] = place.split(",").map((x) => x.trim()); const state = rest.join(", ");
    return { location: place, city, state, facts };
  });
}
/** Parse "plumber | plumbers" lines; the plural is optional. */
export function parseIndustries(text: string) {
  return text.split(/\n/).map((l) => l.trim()).filter(Boolean).map((line) => { const [a, b] = line.split("|").map((x) => x.trim()); return { industry: a, industries: b || pluralize(a) }; });
}

export function buildLocationPage(tpl: { title?: string; blocks: any[] }, v: LocVars, patterns: { title: string; metaTitle: string; metaDescription: string }) {
  const map = varMap(v);
  const title = fill(patterns.title, map, "t").replace(/\s+/g, " ").trim();
  const slug = slugify(title);
  const blocks = fillDeep(tpl.blocks, map, slug).map((b: any) => ({ ...b, id: Math.random().toString(36).slice(2, 10), required: undefined }));
  return {
    title, slug, blocks,
    seo: { metaTitle: fill(patterns.metaTitle, map, slug + "m").slice(0, 70), metaDescription: fill(patterns.metaDescription, map, slug + "d").slice(0, 165), schemaType: "Service", focusKeyword: title.toLowerCase() },
    location: { service: v.service, industry: v.industry || "", city: v.city, state: v.state || "", label: v.location },
  };
}

export const DEFAULT_PATTERNS = {
  withIndustry: { title: "{{Service}} for {{industries}} in {{location}}", metaTitle: "{{Service}} for {{industries}} in {{location}}", metaDescription: "{Fast, search-ready|Modern, high-converting} {{service}} for {{industries}} in {{location}}. Clear packages, honest advice and a free consultation." },
  withoutIndustry: { title: "{{Service}} in {{location}}", metaTitle: "{{Service}} in {{location}}", metaDescription: "{{Service}} for businesses in {{location}}: fast, search-ready work that brings in enquiries. Free consultation." },
};
