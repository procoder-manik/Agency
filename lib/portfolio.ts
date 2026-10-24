/** Public URL name of the portfolio ("work" by default). Set from Admin > Site settings > Portfolio each time settings load. */
export const PORTFOLIO = { base: "work" };
export interface PortfolioCategory { name: string; color: string }
export const catColor = (cats: PortfolioCategory[] | undefined, name?: string) => (name && (cats || []).find((c) => c.name.toLowerCase() === String(name).toLowerCase())?.color) || "";

export interface TermLike { id: number; title: string; data: Record<string, any> }
/** A project's category can be a Portfolio category (id) or, on older entries, a plain name. Returns its display name and colour. */
export function resolveCategory(value: any, terms: TermLike[], legacy?: PortfolioCategory[]) {
  if (value === undefined || value === null || value === "") return { name: "", color: "" };
  if (typeof value === "number" || /^\d+$/.test(String(value))) { const t = terms.find((x) => x.id === Number(value)); return { name: t?.title || "", color: t?.data?.color || "" }; }
  const name = String(value); const t = terms.find((x) => x.title.toLowerCase() === name.toLowerCase());
  return { name: t?.title || name, color: t?.data?.color || catColor(legacy, name) };
}
