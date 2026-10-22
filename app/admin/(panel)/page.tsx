import Link from "next/link";
import { and, desc, eq, isNull, sql as dsql } from "drizzle-orm";
import { requirePage } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { aiAvailable } from "@/lib/ai/providers";
import { PageHead } from "@/components/admin/ui";

const E = schema.entries;
async function count(collection: string) {
  const [r] = await db().select({ n: dsql<number>`count(*)::int` }).from(E).where(and(eq(E.collection, collection), isNull(E.deletedAt)));
  return r.n;
}

export default async function Dashboard({ searchParams }: { searchParams: { denied?: string } }) {
  const user = await requirePage();
  const [projects, posts, pages, services] = await Promise.all(["projects", "posts", "pages", "services"].map(count));
  const [[leads], [subs], recent, drafts, ai] = await Promise.all([
    db().select({ n: dsql<number>`count(*)::int`, fresh: dsql<number>`count(*) filter (where status = 'new')::int` }).from(schema.leads).where(isNull(schema.leads.deletedAt)),
    db().select({ n: dsql<number>`count(*)::int`, unread: dsql<number>`count(*) filter (where read = false)::int` }).from(schema.submissions).where(isNull(schema.submissions.deletedAt)),
    db().select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(8),
    db().select().from(E).where(and(eq(E.status, "draft"), isNull(E.deletedAt))).orderBy(desc(E.updatedAt)).limit(6),
    aiAvailable(),
  ]);
  const stats = [
    { label: "Projects", n: projects, href: "/admin/c/projects" }, { label: "Blog posts", n: posts, href: "/admin/c/posts" },
    { label: "Leads", n: leads.n, sub: `${leads.fresh} new`, href: "/admin/leads" }, { label: "Form submissions", n: subs.n, sub: `${subs.unread} unread`, href: "/admin/submissions" },
    { label: "Pages", n: pages, href: "/admin/c/pages" }, { label: "Services", n: services, href: "/admin/c/services" },
  ];
  return (
    <>
      <PageHead title={`Welcome back${user.name ? ", " + user.name : ""}`} sub="Here's what's happening on your site." />
      {searchParams.denied && <p className="glass mb-6 !border-warning/60 p-4 text-sm text-warning">That screen is for admins only. Ask an admin if you need access.</p>}
      {!ai && <p className="glass mb-6 p-4 text-sm text-fg2">AI writing tools are off. <Link href="/admin/ai" className="text-accent underline">Add a free Gemini, Groq or OpenRouter key</Link> to turn them on.</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => <Link key={s.label} href={s.href} className="glass p-5 transition-colors hover:border-accent/50"><p className="text-sm text-fg2">{s.label}</p><p className="mt-1 font-display text-3xl font-bold">{s.n}</p>{s.sub && <p className="text-sm text-accent">{s.sub}</p>}</Link>)}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="glass p-5">
          <h2 className="mb-4 font-semibold">Quick actions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[["New blog post", "/admin/c/posts/new"], ["New project", "/admin/c/projects/new"], ["Write a page with AI", "/admin/c/pages?ai=1"], ["New case study", "/admin/c/caseStudies?ai=1"], ["Change theme", "/admin/appearance"], ["Edit site identity", "/admin/settings"]].map(([l, h]) => <Link key={h} href={h} className="rounded border border-line px-3 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent">{l}</Link>)}
          </div>
        </section>
        <section className="glass p-5">
          <h2 className="mb-4 font-semibold">Drafts in progress</h2>
          {drafts.length === 0 ? <p className="text-sm text-fg2">No drafts. Everything is published.</p> :
            <ul className="divide-y divide-line">{drafts.map((d) => <li key={d.id}><Link href={`/admin/c/${d.collection}/${d.id}`} className="flex justify-between gap-3 py-2 text-sm hover:text-accent"><span className="truncate">{d.title}</span><span className="shrink-0 text-muted">{d.collection}</span></Link></li>)}</ul>}
        </section>
        <section className="glass p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Recent activity</h2>
          {recent.length === 0 ? <p className="text-sm text-fg2">Nothing yet.</p> :
            <ul className="divide-y divide-line text-sm">{recent.map((r) => <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2"><span><span className="text-fg">{r.userEmail}</span> <span className="text-fg2">{r.action}</span> {r.target}</span><span className="text-muted">{r.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span></li>)}</ul>}
        </section>
      </div>
    </>
  );
}
