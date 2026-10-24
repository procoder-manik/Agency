import { entryUrl } from "../permalinks";
import { getAllSettings, brandTemplate } from "../settings";
import { getPublished } from "../content";
import { getCollection } from "../collections";
import { formatPrice } from "../util";

/** Compact, factual context every AI prompt is built on. */
export async function siteContext() {
  const s = await getAllSettings();
  const [services, packages, projects, pages, posts, cases] = await Promise.all(["services", "packages", "projects", "pages", "posts", "caseStudies"].map((c) => getPublished(c)));
  const svc = services.map((sv) => ({
    id: sv.id, name: sv.title, path: entryUrl("services", sv.slug, sv.data), summary: sv.data.summary || "",
    packages: packages.filter((p) => Number(p.data.service) === sv.id).map((p) => `${p.title}: ${formatPrice(p.data.price, p.data.currency)}${p.data.priceMax ? " to " + formatPrice(p.data.priceMax, p.data.currency) : ""} (${p.data.billing || "one-time"})`),
  }));
  const paths = new Set<string>(["/"]);
  for (const p of pages) paths.add(entryUrl("pages", p.slug, p.data));
  for (const [list, c] of [[services, "services"], [projects, "projects"], [posts, "posts"], [cases, "caseStudies"]] as const)
    for (const e of list) paths.add(getCollection(c)!.publicPath!(e.slug));
  return {
    agency: { name: s.identity.name, tagline: s.identity.tagline, description: s.identity.description, about: s.identity.longDescription, cta: s.identity.ctaLabel, replyTime: s.identity.replyTime },
    services: svc,
    recentWork: projects.slice(0, 8).map((p) => ({ title: p.title, client: p.data.client, industry: p.data.industry, summary: p.data.summary, path: `/work/${p.slug}` })),
    allowedLinks: Array.from(paths),
    titleTemplate: brandTemplate(s.seo.titleTemplate, s.identity.name),
  };
}

export const RULES = `Rules you must follow:
- Write as the agency ("we"), plain and specific, no hype, no clichés like "in today's digital landscape", no em dashes.
- Use ONLY facts given in the context or by the user. Never invent statistics, client names, quotes, testimonials, prices, awards, years in business or results.
- Never include a number (percentages, counts, times, money) unless that exact number appears in the context or the user's input.
- Only link to paths listed in allowedLinks.
- Location pages must never claim a local office, local team or local clients unless the user supplied that fact; describe remote delivery instead.`;
