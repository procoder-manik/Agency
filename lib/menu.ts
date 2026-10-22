/** Normalise a menu link so "/about", "/about/", "https://www.site.com/about" and "about" all match the same page.
 *  Home-page anchors ("/#services") are kept distinct from "/" so toggling a section anchor never removes Home. */
export function normPath(href: string, domain = "") {
  let h = (href || "").trim();
  if (!h) return "";
  try {
    if (/^https?:\/\//i.test(h)) {
      const u = new URL(h);
      const own = domain ? new URL(/^https?:/.test(domain) ? domain : "https://" + domain).hostname.replace(/^www\./, "") : "";
      if (own && u.hostname.replace(/^www\./, "") !== own) return h.toLowerCase(); // external link
      h = u.pathname + u.hash;
    }
  } catch {}
  if (!h.startsWith("/") && !h.startsWith("#")) h = "/" + h;
  if (h.startsWith("#")) h = "/" + h;
  const [p, hash] = h.split("#");
  let path = p.replace(/\/+$/, "") || "/";
  path = path.toLowerCase();
  return hash ? `${path}#${hash.toLowerCase()}` : path;
}
export const samePage = (a: string, b: string, domain = "") => normPath(a, domain) === normPath(b, domain);

export interface NavLink { label: string; href: string }
export interface NavColumn { title: string; links: NavLink[] }
export interface Navigation { header: NavLink[]; footer: NavColumn[] }

/** Read/write a page's presence in the central menus (single source of truth). */
export function menuState(nav: Navigation, path: string, domain = "") {
  const header = nav.header.some((l) => samePage(l.href, path, domain));
  const footerCols = nav.footer.map((c, i) => (c.links.some((l) => samePage(l.href, path, domain)) ? i : -1)).filter((i) => i >= 0);
  return { header, footer: footerCols.length > 0, footerCols };
}
export function setMenu(nav: Navigation, path: string, label: string, want: { header?: boolean; footer?: boolean; footerCol?: number }, domain = ""): Navigation {
  const out: Navigation = { header: [...nav.header], footer: nav.footer.map((c) => ({ ...c, links: [...c.links] })) };
  if (want.header !== undefined) {
    const has = out.header.some((l) => samePage(l.href, path, domain));
    if (want.header && !has) out.header.push({ label, href: path });
    if (!want.header) out.header = out.header.filter((l) => !samePage(l.href, path, domain));
  }
  if (want.footer !== undefined) {
    const has = out.footer.some((c) => c.links.some((l) => samePage(l.href, path, domain)));
    if (want.footer && !has) {
      if (!out.footer.length) out.footer.push({ title: "Links", links: [] });
      out.footer[Math.min(Math.max(0, want.footerCol ?? 0), out.footer.length - 1)].links.push({ label, href: path });
    }
    if (!want.footer) out.footer = out.footer.map((c) => ({ ...c, links: c.links.filter((l) => !samePage(l.href, path, domain)) }));
  }
  return out;
}
