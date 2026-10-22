import Link from "next/link";

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
    <section className="tex relative overflow-hidden pb-14 pt-12 sm:pt-16">
      <div className="aurora opacity-50" aria-hidden><span /><span /><span /></div>
      <div className="container-x">
        <Crumbs items={crumbs} />
        <h1 className="fade-in max-w-4xl font-display text-[clamp(2.2rem,5vw,4.2rem)] font-bold leading-[1.02] tracking-tight">{title}</h1>
        {sub && <p className="lead fade-in mt-6" style={{ animationDelay: "120ms" }}>{sub}</p>}
        {children}
      </div>
    </section>
  );
}
