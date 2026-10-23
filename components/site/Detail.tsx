import Link from "next/link";
import { HeroCanvas, SplitText } from "./fx";

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link href="/" className="hover:text-fg">Home</Link></li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2"><span aria-hidden>/</span>{c.href ? <Link href={c.href} className="hover:text-fg">{c.name}</Link> : <span aria-current="page" className="text-fg2">{c.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function DetailHero({ crumbs, title, sub, children }: { crumbs: { name: string; href?: string }[]; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <section className="tex relative overflow-hidden pb-16 pt-10 sm:pt-16">
      <HeroCanvas />
      <div className="container-x">
        <Crumbs items={crumbs} />
        <SplitText as="h1" text={title} className="h-section max-w-5xl" />
        {sub && <p className="lead fade-in mt-6" style={{ animationDelay: "120ms" }}>{sub}</p>}
        {children}
      </div>
    </section>
  );
}
