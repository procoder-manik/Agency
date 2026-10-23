import Link from "next/link";
import { getPublishedBySlug, related } from "@/lib/content";
import { buildJsonLd, buildMetadata, ogFallback } from "@/lib/seo";
import { getAllSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { JsonLd, handleMissing } from "@/lib/page-render";
import { Crumbs } from "@/components/site/Detail";
import { Media, Reveal } from "@/components/site/motion";

type P = { params: { slug: string } };

export async function generateMetadata({ params }: P) {
  const c = await getPublishedBySlug("caseStudies", params.slug); if (!c) return {};
  return buildMetadata({ title: c.title, description: c.data.summary, path: `/case-studies/${c.slug}`, seo: c.seo, image: mediaUrl(c.data.cover), ogLabel: "Case Study", kind: "case", type: "article", publishedAt: c.publishedAt });
}

export default async function CaseStudyPage({ params }: P) {
  const s = await getAllSettings();
  const c = await getPublishedBySlug("caseStudies", params.slug);
  if (!c || !s.features.caseStudies) return handleMissing(`/case-studies/${params.slug}`);
  const d = c.data;
  const [services, [project]] = await Promise.all([related("services", d.services), related("projects", d.project)]);
  const coverSrc = mediaUrl(d.cover);
  const cover = coverSrc || ogFallback(c.title, "case", "Case Study");
  const ld = await buildJsonLd({ type: c.seo?.schemaType && c.seo.schemaType !== "auto" ? c.seo.schemaType : "Article", title: c.title, description: d.summary, path: `/case-studies/${c.slug}`, image: cover, datePublished: c.publishedAt, dateModified: c.updatedAt, crumbs: [{ name: "Case studies", path: "/case-studies" }, { name: c.seo?.breadcrumbTitle || c.title, path: `/case-studies/${c.slug}` }] });
  const results = (d.results || []).filter((r: any) => r.value);
  return (
    <>
      <JsonLd data={ld} />
      <section className="tex relative overflow-hidden pb-16 pt-12 sm:pt-16">
        <div className="aurora opacity-50" aria-hidden><span /><span /><span /></div>
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <Crumbs items={[{ name: "Case studies", href: "/case-studies" }, { name: c.title }]} />
            <p className="fade-in text-fg2">{[d.client, d.industry].filter(Boolean).join(", ")}</p>
            <h1 className="fade-in mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight">{c.title}</h1>
            {d.summary && <p className="lead fade-in mt-6">{d.summary}</p>}
            {services.length > 0 && <div className="mt-7 flex flex-wrap gap-2">{services.map((sv) => <Link key={sv.id} href={`/services/${sv.slug}`} className="chip hover:!border-accent">{sv.title}</Link>)}</div>}
          </div>
          <div className="glass fade-in overflow-hidden p-2"><Media src={coverSrc} poster={c.title} alt={mediaAlt(d.cover, c.title)} priority className="aspect-[4/5] w-full" /></div>
        </div>
      </section>
      {results.length > 0 && <section className="pb-6"><div className="container-x"><div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4" style={{ borderRadius: "var(--r-lg)" }}>
        {results.map((r: any, i: number) => <div key={i} className="bg-bg p-7"><p className="font-display text-4xl font-bold text-accent">{r.value}</p><p className="mt-1 text-fg2">{r.label}</p></div>)}
      </div></div></section>}
      <section className="section"><div className="container-x max-w-3xl space-y-16">
        {d.overview && <Reveal><h2 className="h-section mb-5">Overview</h2><div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.overview) }} /></Reveal>}
        {(d.challenges || []).length > 0 && <Reveal><h2 className="h-section mb-6">The challenge</h2><div className="space-y-4">{d.challenges.map((x: any, i: number) => <div key={i} className="glass p-6"><h3 className="text-lg font-semibold">{x.title}</h3>{x.text && <p className="mt-2 text-fg2">{x.text}</p>}</div>)}</div></Reveal>}
        {(d.approach || []).length > 0 && <Reveal><h2 className="h-section mb-6">Our approach</h2><ol className="relative border-l border-line pl-8">{d.approach.map((x: any, i: number) => <li key={i} className="relative pb-8 last:pb-0"><span className="absolute -left-[45px] grid h-7 w-7 place-items-center rounded-full bg-accent font-mono text-xs font-bold text-onaccent">{i + 1}</span><h3 className="text-lg font-semibold">{x.title}</h3>{x.text && <p className="mt-2 text-fg2">{x.text}</p>}</li>)}</ol></Reveal>}
        {d.resultsText && <Reveal><h2 className="h-section mb-5">Results</h2><div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.resultsText) }} /></Reveal>}
        {mediaUrl(d.media) && <Reveal><div className="glass overflow-hidden p-2"><Media src={mediaUrl(d.media)} alt={mediaAlt(d.media, c.title)} className="aspect-video w-full" /></div></Reveal>}
        {(d.technologies || []).length > 0 && <div><p className="mb-3 text-sm text-muted">Built with</p><div className="flex flex-wrap gap-2">{d.technologies.map((t: string) => <span key={t} className="chip">{t}</span>)}</div></div>}
        {project && <Link href={`/work/${project.slug}`} className="card block p-6 transition-colors hover:border-accent/50"><p className="text-fg2">See the project</p><p className="mt-1 text-xl font-semibold">{project.title}</p></Link>}
      </div></section>
    </>
  );
}
