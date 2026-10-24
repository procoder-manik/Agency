export const slugify = (s: string) => (s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export function formatPrice(n: number | string | undefined, currency = "USD") {
  const v = Number(n); if (!isFinite(v) || !n) return "";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v); } catch { return `${currency} ${v}`; }
}
export const fmtDate = (d?: string | Date | null) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "");
export const truncate = (s: string, n: number) => (s && s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s || "");
export const stripMd = (s: string) => (s || "").replace(/```[\s\S]*?```/g, "").replace(/[#>*_`~\[\]()!-]/g, "").replace(/\s+/g, " ").trim();

/** Options for a select field. Separate with | or new lines (best). Old comma lists still work,
 *  and a comma inside a number such as $1,000 is not treated as a separator. */
export function parseOptions(raw: any): string[] {
  const t = String(raw ?? "");
  const parts = /[|\n;]/.test(t) ? t.split(/[|\n;]/) : t.split(/,(?!\d{3}(?!\d))/);
  return parts.map((x) => x.trim()).filter(Boolean);
}
