import { and, eq, isNull, sql as dsql } from "drizzle-orm";
import { requirePage } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { getActiveTheme } from "@/lib/theme-server";
import { aiAvailable } from "@/lib/ai/providers";
import { memo } from "@/lib/memo";
import { db, schema } from "@/lib/db";
import { COLLECTIONS } from "@/lib/collections";
import { Sidebar, type NavGroup, type NavItem } from "@/components/admin/Sidebar";
import { AdminProvider } from "@/components/admin/context";
import { Toaster } from "@/components/admin/ui";

export const metadata = { robots: { index: false, follow: false }, title: "Admin" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage();
  const [s, theme, aiOn] = await Promise.all([getAllSettings(), getActiveTheme(), aiAvailable()]);
  // the two sidebar badges are cached for a few seconds so every admin click does not repeat these queries
  const [[{ n: unread }], [{ n: newLeads }]] = await Promise.all([
    memo("admin:unread", 8_000, () => db().select({ n: dsql<number>`count(*)::int` }).from(schema.submissions).where(and(eq(schema.submissions.read, false), isNull(schema.submissions.deletedAt)))),
    memo("admin:newLeads", 8_000, () => db().select({ n: dsql<number>`count(*)::int` }).from(schema.leads).where(and(eq(schema.leads.status, "new"), isNull(schema.leads.deletedAt), dsql`${schema.leads.createdAt} > now() - interval '7 days'`))),
  ]);
  const admin = user.role === "admin";
  /** One WordPress-style section: the list, Add New, and (when the type has them) its own Categories and Tags. */
  const type = (key: string, label: string, o: { cats?: string; tags?: boolean } = {}): NavItem => {
    const base = `/admin/c/${key}`;
    const children = [{ label: `All ${label}`, href: base }, { label: "Add New", href: `${base}/new` }, ...(o.cats ? [{ label: "Categories", href: `/admin/c/${o.cats}` }] : []), ...(o.tags ? [{ label: "Tags", href: `/admin/tags/${key}` }] : [])];
    return { label, href: base, children, match: [base, ...(o.cats ? [`/admin/c/${o.cats}`] : []), ...(o.tags ? [`/admin/tags/${key}`] : [])] };
  };
  const groups: NavGroup[] = [
    { title: "Dashboard", items: [{ label: "Overview", href: "/admin" }] },
    { title: "Content", items: [
      type("pages", "Pages", { cats: "pageCategories", tags: true }), type("posts", "Posts", { cats: "categories", tags: true }),
      type("projects", "Portfolio", { cats: "projectCategories", tags: true }), type("caseStudies", "Case studies", { cats: "caseStudyCategories", tags: true }),
      type("services", "Services"), type("packages", "Packages"), type("team", "Team"), type("testimonials", "Testimonials"), type("faqs", "FAQ and help"),
      { label: "Media library", href: "/admin/media" },
    ] },
    { title: "CRM and marketing", items: [
      { label: "Leads", href: "/admin/leads", badge: newLeads },
      ...(admin ? [{ label: "Email campaigns", href: "/admin/email" }] : []),
      { label: "Form submissions", href: "/admin/submissions", badge: unread },
      type("forms", "Forms"), type("popups", "Popups and announcements"),
      { label: "Location pages", href: "/admin/locations" },
    ] },
    ...(admin ? [
      { title: "Design", items: [{ label: "Themes", href: "/admin/appearance" }, { label: "Menus, header and footer", href: "/admin/navigation" }, type("modules", "Custom modules")] },
      { title: "SEO", items: [{ label: "SEO, redirects and 404s", href: "/admin/seo" }] },
      { title: "AI", items: [{ label: "AI tools", href: "/admin/ai" }] },
      { title: "Chatbot", items: [{ label: "Training", href: "/admin/chat" }, { label: "Settings", href: "/admin/chat/settings" }, { label: "Notifications", href: "/admin/chat/notifications" }] },
      { title: "Settings", items: [{ label: "Site settings", href: "/admin/settings" }, { label: "Users and my account", href: "/admin/users" }, { label: "Audit log", href: "/admin/audit" }] },
    ] : [{ title: "Account", items: [{ label: "My account", href: "/admin/users" }] }]),
  ];
  return (
    <AdminProvider value={{ role: user.role, email: user.email, aiOn, colors: theme.tokens.colors, siteName: s.identity.name }}>
      <div className="min-h-screen lg:flex">
        <Sidebar groups={groups} user={{ email: user.email, role: user.role }} siteName={s.identity.name} />
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8"><div className="mx-auto max-w-6xl">{children}</div></div>
      </div>
      <Toaster />
    </AdminProvider>
  );
}
