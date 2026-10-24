import { and, eq, isNull, sql as dsql } from "drizzle-orm";
import { requirePage } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { getActiveTheme } from "@/lib/theme-server";
import { aiAvailable } from "@/lib/ai/providers";
import { db, schema } from "@/lib/db";
import { COLLECTIONS } from "@/lib/collections";
import { Sidebar, type NavGroup } from "@/components/admin/Sidebar";
import { AdminProvider } from "@/components/admin/context";
import { Toaster } from "@/components/admin/ui";

export const metadata = { robots: { index: false, follow: false }, title: "Admin" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage();
  const [s, theme, aiOn] = await Promise.all([getAllSettings(), getActiveTheme(), aiAvailable()]);
  const [{ n: unread }] = await db().select({ n: dsql<number>`count(*)::int` }).from(schema.submissions).where(and(eq(schema.submissions.read, false), isNull(schema.submissions.deletedAt)));
  const [{ n: newLeads }] = await db().select({ n: dsql<number>`count(*)::int` }).from(schema.leads).where(and(eq(schema.leads.status, "new"), isNull(schema.leads.deletedAt)));
  const admin = user.role === "admin";
  const groups: NavGroup[] = [
    { title: "Content", items: [{ label: "Dashboard", href: "/admin" }, ...COLLECTIONS.filter((c) => c.group === "Content").map((c) => ({ label: c.label, href: `/admin/c/${c.key}` })), { label: "Media library", href: "/admin/media" }] },
    { title: "Marketing", items: [{ label: "Location pages", href: "/admin/locations" }, { label: "Leads", href: "/admin/leads", badge: newLeads }, ...(admin ? [{ label: "Email marketing", href: "/admin/email" }] : []), { label: "Form submissions", href: "/admin/submissions", badge: unread }, ...COLLECTIONS.filter((c) => c.group === "Marketing").map((c) => ({ label: c.label, href: `/admin/c/${c.key}` }))] },
    ...(admin ? [
      { title: "Design", items: COLLECTIONS.filter((c) => c.group === "Design").map((c) => ({ label: c.label, href: `/admin/c/${c.key}` })) },
      { title: "AI", items: [{ label: "AI tools", href: "/admin/ai" }] },
      { title: "SEO", items: [{ label: "SEO, redirects & 404s", href: "/admin/seo" }] },
      { title: "Appearance", items: [{ label: "Themes", href: "/admin/appearance" }, { label: "Navigation", href: "/admin/navigation" }] },
      { title: "Settings", items: [{ label: "Site settings", href: "/admin/settings" }, { label: "Users", href: "/admin/users" }, { label: "Audit log", href: "/admin/audit" }] },
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
