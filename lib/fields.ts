/** Field-definition types shared by collections, page-builder blocks and the admin form renderer. */
export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "select" | "toggle" | "image" | "media" | "tags"
  | "list" | "relation" | "color" | "date" | "url";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: { value: string; label: string }[];
  fields?: Field[]; // for list
  collection?: string; // for relation
  multiple?: boolean; // relation
  size?: string; // image slot guidance e.g. "1600 × 900 (16:9)"
  ai?: boolean; // show "Write with AI" (defaults on for text/textarea/markdown)
  placeholder?: string;
  required?: boolean;
  mono?: boolean; // monospace textarea for code
  rows?: number;
}

export const opts = (...v: string[]) => v.map((x) => { const [value, label] = x.split("|"); return { value, label: label || value }; });

export function aiAllowed(f: Field) {
  if (f.ai === false) return false;
  if (f.ai === true) return true;
  return ["text", "textarea", "markdown"].includes(f.type) && !/(slug|url|href|price|date|color|email|phone|icon)/i.test(f.name);
}

export const SCHEMA_TYPES = ["auto", "WebPage", "AboutPage", "ContactPage", "CollectionPage", "FAQPage", "Article", "BlogPosting", "Service", "Product", "HowTo", "CreativeWork"];
