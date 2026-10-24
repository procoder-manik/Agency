import Link from "next/link";
import { getPublishedBySlug, getPublished, related } from "@/lib/content";
import { buildJsonLd, buildMetadata, ogFallback } from "@/lib/seo";
import { renderMarkdown } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { fmtDate } from "@/lib/util";
import { getAllSettings } from "@/lib/settings";
import { resolveCategory } from "@/lib/portfolio";
import { entryUrl } from "@/lib/permalinks";
import { JsonLd, handleMissing } from "@/lib/page-render";
import { Crumbs } from "@/components/site/Detail";
import { Media, Reveal } from "@/components/site/motion";
import { ScrollShot } from "@/components/site/ScrollShot";
import { WorkGrid } from "@/components/site/Interactive";
import { workCards } from "@/components/site/Blocks";

const STATUS: Record<string, string> = { completed: "Live", ongoing: "Still building", care: "Ongoing care" };

export async function projectMetadata(slug: string) {
  const p = await getPublishedBySlug("projects", slug); if (!p) return {};
  const base = (await getAllSettings()).portfolio.base;
  return buildMetadata({ title: p.title, description: p.data.summary, path: entryUrl("projects", p.slug, p.data), seo: p.seo, image: mediaUrl(p.data.cover) || mediaUrl(p.data.screenshot), ogLabel: "Work" });
}

/** "3 weeks", "2 months" from the start and end dates (only for finished work). */
function duration(a?: string, b?: string) {
  if (!a || !b) return ""; const days = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
  if (!(days > 0)) return ""; if (days < 14) return `${days} days`; if (days < 60) return `${Math.round(days / 7)} weeks`; return `${Math.round(days / 30)} months`;
}

/** One project page. Used by /work/[slug] and, when the portfolio URL name is changed in settings, by the catch-all route. */
export async function ProjectView({ slug }: { slug: string }) {
  const p = await getPublishedBySlug("projects", slug);
  if (!p) return handleMissing(`/${(await getAllSettings()).portfolio.base}/${slug}`);
  const d = p.data;
  const [services, all, s, cases] = await Promise.all([related("services", d.services), getPublished("projects"), getAllSettings(), getPublished("caseStudies")]);
  const cs = cases.find((c) => Number(c.data.project) === p.id);
  const scroll = mediaUrl(d.scrollImage);
  const shot = scroll || mediaUrl(d.screenshot) || mediaUrl(d.cover);
  const heroSrc = mediaUrl(d.cover) || mediaUrl(d.screenshot);
  const ld = await buildJsonLd({ type: p.seo?.schemaType && p.seo.schemaType !== "auto" ? p.seo.schemaType : "CreativeWork", title: p.title, description: d.summary, path: entryUrl("projects", p.slug, p.data), image: heroSrc || ogFallback(p.title, "page", "Work"), crumbs: [{ name: s.portfolio.label || "Work", path: `/${s.portfolio.base}` }, { name: p.seo?.breadcrumbTitle || p.title, path: entryUrl("projects", p.slug, p.data) }], dateModified: p.updatedAt });
  const idx = all.findIndex((x) => x.id === p.id); const prev = all.length > 1 ? all[(idx - 1 + all.length) % all.length] : null; const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const others = all.filter((x) => x.id !== p.id).slice(0, 3);
  const dur = d.workStatus === "completed" || !d.workStatus ? duration(d.startDate, d.endDate) : "";
  const metrics = (Array.isArray(d.metrics) ? d.metrics : []).filter((m: any) => m?.value && m?.label);
  const deliverables: string[] = Array.isArray(d.deliverables) ? d.deliverables : [];
  const tech: string[] = Array.isArray(d.technologies) ? d.technologies : [];
  const body = renderMarkdown(d.body || "");
  const video = mediaUrl(d.video);
  const facts: [string, React.ReactNode][] = [
    ["Client", d.client], ["Industry", d.industry], ["Platform", d.platform], ["Status", STATUS[d.workStatus] || "Live"],
    ["Services", services.length ? services.map((sv, i) => <span key={sv.id}>{i > 0 && ", "}<Link className="text-accent hover:underline" href={entryUrl("services", sv.slug, sv.data)}>{sv.title}</Link></span>) : null],
    ["Started", fmtDate(d.startDate)], ["Finished", d.workStatus === "completed" || !d.workStatus ? fmtDate(d.endDate) : ""], ["Duration", dur],
  ];
  const cat = resolveCategory(d.category, await getPublished("projectCategories"), s.portfolio.categories);
  const accent = d.accent || cat.color || undefined;
  const tags: string[] = Array.isArray(d.tags) ? d.tags : [];
  const base = s.portfolio.base, label = s.portfolio.label || "Work";
  return (
    <>
      <JsonLd data={ld} />
      <header className="relative overflow-hidden pb-12 pt-10 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/3 h-[480px] w-[480px] rounded-full blur-[130px]" style={{ background: accent ? `${accent}33` : "rgb(var(--c-accent) / .18)" }} />
        <div className="container-x relative">
          <Crumbs items={[{ name: label, href: `/${base}` }, { name: p.title }]} />
          <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                {cat.name && <span className="chip font-semibold" style={{ borderColor: accent, color: accent }}><span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: accent }} />{cat.name}</span>}
                {d.platform && <span className="chip !border-transparent font-semibold text-onaccent" style={{ background: accent || "rgb(var(--c-accent))" }}>{d.platform}</span>}
                {d.workStatus && d.workStatus !== "completed" && <span className="chip !text-accent">{STATUS[d.workStatus]}</span>}
                {services.map((sv) => <span key={sv.id} className="chip">{sv.title}</span>)}
              </div>
              <h1 className="fade-in mt-6 font-display text-[clamp(2.4rem,5.5vw,4.6rem)] font-bold leading-[1.1] tracking-[-0.035em]">{p.title}</h1>
              {d.summary && <p className="lead fade-in mt-6 !max-w-2xl" style={{ animationDelay: "80ms" }}>{d.summary}</p>}
            </div>
            {d.liveUrl && <div className="flex lg:justify-end"><a href={d.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Visit live site<span className="arrow" aria-hidden>↗</span></a></div>}
          </div>
        </div>
      </header>

      <section className="container-x">
        <Reveal>
          {scroll
            ? <><ScrollShot src={scroll} alt={mediaAlt(d.scrollImage, `${p.title} full-page screenshot`)} url={d.liveUrl} accent={accent} mode="manual" speed={260} eager className="shadow-[0_60px_120px_-60px_rgb(0_0_0/.6)]" />
              <p className="mt-3 text-center text-sm text-muted">Scroll inside the window to see the whole page, or press Auto scroll.</p></>
            : <div className="glass overflow-hidden p-2" style={accent ? { boxShadow: `0 40px 120px -50px ${accent}` } : undefined}><Media src={shot} poster={p.title} alt={mediaAlt(d.cover || d.screenshot, p.title)} priority className="aspect-[16/9] w-full" /></div>}
        </Reveal>
      </section>

      {metrics.length > 0 && (
        <section className="container-x pt-14"><dl className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-4" style={{ borderRadius: "var(--r-lg)" }}>
          {metrics.map((m: any, i: number) => <div key={i} className="bg-surface p-6"><dd className="font-display text-3xl font-bold" style={{ color: accent }}>{m.value}</dd><dt className="mt-1 text-sm text-muted">{m.label}</dt></div>)}
        </dl></section>
      )}

      <section className="section !pt-16"><div className="container-x grid gap-14 lg:grid-cols-[1.7fr_1fr]">
        <div className="min-w-0">
          {body && <div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: body }} />}
          {deliverables.length > 0 && (
            <div className={body ? "mt-14" : ""}>
              <h2 className="text-2xl font-semibold">{d.workStatus === "care" ? "What we look after" : d.workStatus === "ongoing" ? "What we are delivering" : "What we delivered"}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">{deliverables.map((x) => <li key={x} className="flex gap-3 border border-line bg-surface p-4" style={{ borderRadius: "var(--r-md)" }}><span aria-hidden className="mt-0.5 text-accent" style={accent ? { color: accent } : undefined}>✓</span><span>{x}</span></li>)}</ul>
            </div>
          )}
          {video && <div className="mt-14"><h2 className="mb-5 text-2xl font-semibold">Video walkthrough</h2><div className="overflow-hidden border border-line bg-raised" style={{ borderRadius: "var(--r-lg)" }}><Media src={video} alt={`${p.title} walkthrough`} cover={false} className="aspect-video w-full" /></div></div>}
          {(d.gallery || []).length > 0 && <div className="mt-14 grid gap-5 sm:grid-cols-2">{d.gallery.map((g: any, i: number) => <Reveal key={i}><figure className="glass overflow-hidden p-1.5"><Media src={mediaUrl(g.image)} alt={mediaAlt(g.image, g.caption || p.title)} className="aspect-[16/10] w-full" />{g.caption && <figcaption className="p-2 text-sm text-fg2">{g.caption}</figcaption>}</figure></Reveal>)}</div>}
          {cs && <Link href={entryUrl("caseStudies", cs.slug, cs.data)} className="card mt-14 block p-8 transition-colors hover:border-accent/50"><p className="text-fg2">Read the full story</p><p className="mt-1 font-display text-2xl font-bold">{cs.title}</p></Link>}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass p-6">
            <h2 className="text-lg font-semibold">Project details</h2>
            <dl className="mt-5 divide-y divide-line text-[0.95rem]">{facts.filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-fg">{v}</dd></div>)}</dl>
            {tags.length > 0 && <div className="mt-5 border-t border-line pt-5"><p className="text-sm text-muted">Tags</p><div className="mt-3 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div></div>}
            {tech.length > 0 && <div className="mt-5 border-t border-line pt-5"><p className="text-sm text-muted">Built with</p><div className="mt-3 flex flex-wrap gap-2">{tech.map((t) => <span key={t} className="chip">{t}</span>)}</div></div>}
            {d.liveUrl && <a href={d.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-6 w-full">Open {(() => { try { return new URL(d.liveUrl).hostname.replace(/^www\./, ""); } catch { return "site"; } })()}<span aria-hidden>↗</span></a>}
          </div>
          <div className="mt-5 border border-line bg-gradient-to-br from-accent/15 to-transparent p-6" style={{ borderRadius: "var(--r-xl)" }}>
            <p className="font-display text-xl font-semibold text-fg">Want a site like this?</p>
            <p className="mt-2 text-[0.95rem] text-fg2">Tell us about your project and get a scope and price {s.identity.replyTime ? s.identity.replyTime : "soon"}.</p>
            <Link href={s.identity.ctaHref || "/contact"} className="btn btn-primary mt-5 !py-2.5 text-sm">{s.identity.ctaLabel || "Start a project"}<span className="arrow" aria-hidden>→</span></Link>
          </div>
        </aside>
      </div></section>

      {prev && next && (
        <nav className="container-x grid gap-4 border-t border-line py-10 sm:grid-cols-2" aria-label="More projects">
          <Link href={entryUrl("projects", prev.slug, prev.data)} className="group rounded-[var(--r-lg)] p-4 transition-colors hover:bg-surface"><span className="text-sm text-muted">← Previous</span><span className="mt-1 block font-display text-xl font-semibold group-hover:text-accent">{prev.title}</span></Link>
          <Link href={entryUrl("projects", next.slug, next.data)} className="group rounded-[var(--r-lg)] p-4 text-right transition-colors hover:bg-surface"><span className="text-sm text-muted">Next →</span><span className="mt-1 block font-display text-xl font-semibold group-hover:text-accent">{next.title}</span></Link>
        </nav>
      )}

      {others.length > 0 && <section className="section border-t border-line"><div className="container-x"><h2 className="h-section mb-12">More {label.toLowerCase() === "work" ? "work" : label}</h2><WorkGrid items={await workCards(others)} /></div></section>}
    </>
  );
}
