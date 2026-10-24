/** Public URL name of the portfolio ("work" by default). Set from Admin > Site settings > Portfolio each time settings load. */
export const PORTFOLIO = { base: "work" };
export const RESERVED_BASES = ["admin", "api", "blog", "services", "case-studies", "media", "contact", "pricing", "about", "faq", "help", "privacy", "terms", "sitemap", "robots", "og", "checkout", "account", "home", "_next", "favicon"];
export const isValidBase = (b: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(b) && b.length <= 40 && !RESERVED_BASES.includes(b);
export interface PortfolioCategory { name: string; color: string }
export const catColor = (cats: PortfolioCategory[] | undefined, name?: string) => (name && (cats || []).find((c) => c.name.toLowerCase() === String(name).toLowerCase())?.color) || "";
