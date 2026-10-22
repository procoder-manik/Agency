import Link from "next/link";
import { getPublishedBySlug, getPublished, related } from "@/lib/content";
import { buildJsonLd, buildMetadata, ogFallback } from "@/lib/seo";
import { renderMarkdown } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { fmtDate } from "@/lib/util";
import { JsonLd, handleMissing } from "@/lib/page-render";
import { DetailHero } from "@/components/site/Detail";
import { Media, Reveal } from "@/components/site/motion";

type P = { params: { slug: string } };
const STATUS: Record<string, string> = { completed: "Live", ongoing: "Still building", care: "Ongoing care" };

export async function generateMetadata({ params }: P) {
  const p = await getPublishedBySlug("projects", params.slug); if (!p) return {};
  return buildMetadata({ title: p.title, description: p.data.summary, path: `/work/${p.slug}`, seo: p.seo, image: mediaUrl(p.data.cover) || mediaUrl(p.data.screenshot), ogLabel: "Work" });
}

export default async function WorkPage({ params }: P) {
  const p = await getPublishedBySlug("projects", params.slug);
  if (!p) return handleMissing(`/work/${params.slug}`);
  const d = p.data;
  const services = await related("services", d.services);
  const cs = (await getPublished("caseStudies")).find((c) => Number(c.data.project) === p.id);
  const hero = mediaUrl(d.cover) || mediaUrl(d.screenshot) || ogFallback(p.title, "page", "Work");
  const ld = await buildJsonLd({ type: p.seo?.schemaType && p.seo.schemaType !== "auto" ? p.seo.schemaType : "CreativeWork", title: p.title, description: d.summary, path: `/work/${p.slug}`, image: hero, crumbs: [{ name: "Work", path: "/work" }, { name: p.seo?.breadcrumbTitle || p.title, path: `/work/${p.slug}` }], dateModified: p.updatedAt });
  const facts: [string, React.ReactNode][] = [
    ["Client", d.client], ["Industry", d.industry], ["Status", STATUS[d.workStatus] || "Live"], ["Platform", d.platform],
    ["Services", services.length ? services.map((s, i) => <span key={s.id}>{i > 0 && ", "}<Link className="text-accent hover:underline" href={`/services/${s.slug}`}>{s.title}</Link></span>) : null],
    ["Technologies", (d.technologies || []).join(", ")], ["Timeline", [fmtDate(d.startDate), d.workStatus === "completed" ? fmtDate(d.endDate) : "present"].filter(Boolean).join(" to ")],
  ];
  return (
    <>
      <JsonLd data={ld} />
      <DetailHero crumbs={[{ name: "Work", href: "/work" }, { name: p.title }]} title={p.title} sub={d.summary}>
        {d.liveUrl && <a href={d.liveUrl} target="_blank" rel="noopener" className="btn btn-ghost fade-in mt-8">Visit the live site</a>}
      </DetailHero>
      <section className="pb-10"><div className="container-x"><Reveal><div className="glass overflow-hidden p-2" style={d.accent ? { boxShadow: `0 40px 120px -50px ${d.accent}` } : undefined}><Media src={hero} alt={mediaAlt(d.cover || d.screenshot, p.title)} priority className="aspect-[16/9] w-full" /></div></Reveal></div></section>
      <section className="section !pt-10"><div className="container-x grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.body || "") }} />
        <aside><dl className="glass sticky top-24 space-y-4 p-6">{facts.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-sm text-muted">{k}</dt><dd className="mt-0.5 text-fg">{v}</dd></div>)}</dl></aside>
      </div></section>
      {(d.gallery || []).length > 0 && <section className="section !pt-0"><div className="container-x grid gap-4 sm:grid-cols-2">{d.gallery.map((g: any, i: number) => <Reveal key={i}><figure className="glass overflow-hidden p-1.5"><Media src={mediaUrl(g.image)} alt={mediaAlt(g.image, g.caption || p.title)} className="aspect-[16/10] w-full" />{g.caption && <figcaption className="p-2 text-sm text-fg2">{g.caption}</figcaption>}</figure></Reveal>)}</div></section>}
      {cs && <section className="section !pt-0"><div className="container-x"><Link href={`/case-studies/${cs.slug}`} className="card block p-8 transition-colors hover:border-accent/50"><p className="text-fg2">Read the full story</p><p className="mt-1 font-display text-2xl font-bold">{cs.title}</p></Link></div></section>}
    </>
  );
}
