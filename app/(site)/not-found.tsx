import Link from "next/link";
import { getPublished } from "@/lib/content";
import { visibleNav } from "@/lib/site";
import { NotFoundSearch } from "@/components/site/NotFoundSearch";

export default async function NotFound() {
  const [pages, services, posts, work] = await Promise.all(["pages", "services", "posts", "projects"].map((c) => getPublished(c)));
  const nav = await visibleNav();
  const items = [
    ...pages.map((p) => ({ title: p.title, href: p.slug === "home" ? "/" : `/${p.slug}`, kind: "Page" })),
    ...services.map((s) => ({ title: s.title, href: `/services/${s.slug}`, kind: "Service" })),
    ...work.map((s) => ({ title: s.title, href: `/work/${s.slug}`, kind: "Work" })),
    ...posts.map((s) => ({ title: s.title, href: `/blog/${s.slug}`, kind: "Article" })),
  ];
  return (
    <section className="tex relative overflow-hidden py-24 text-center sm:py-32">
      <div className="aurora" aria-hidden><span /><span /><span /></div>
      <div className="container-x">
        <p className="font-display text-[clamp(5rem,18vw,11rem)] font-bold leading-none tracking-tighter text-accent/90">404</p>
        <h1 className="h-section mt-4">This page isn&apos;t here</h1>
        <p className="lead mx-auto mt-4">The link may be old or mistyped. Search below or pick a section.</p>
        <NotFoundSearch items={items} />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go to the home page</Link>
          {nav.header.slice(0, 4).map((l) => <Link key={l.href} href={l.href} className="btn btn-ghost">{l.label}</Link>)}
        </div>
      </div>
    </section>
  );
}
