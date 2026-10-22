import Link from "next/link";
import { getPublishedBySlug, getPublished, related } from "@/lib/content";
import { buildJsonLd, buildMetadata } from "@/lib/seo";
import { getAllSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { JsonLd, handleMissing } from "@/lib/page-render";
import { DetailHero } from "@/components/site/Detail";
import { Media, Reveal } from "@/components/site/motion";
import { FaqList, PricingTabs, WorkGrid } from "@/components/site/Interactive";
import { pricingGroups, workCards } from "@/components/site/Blocks";

type P = { params: { slug: string } };

export async function generateMetadata({ params }: P) {
  const s = await getPublishedBySlug("services", params.slug); if (!s) return {};
  return buildMetadata({ title: s.title, description: s.data.summary, path: `/services/${s.slug}`, seo: s.seo, image: mediaUrl(s.data.cover), ogLabel: "Service" });
}

export default async function ServicePage({ params }: P) {
  const svc = await getPublishedBySlug("services", params.slug);
  if (!svc) return handleMissing(`/services/${params.slug}`);
  const d = svc.data; const st = await getAllSettings();
  const groups = st.features.pricing ? await pricingGroups(svc.id) : [];
  let work = await related("projects", d.relatedWork);
  if (!work.length) work = (await getPublished("projects")).filter((p) => (p.data.services || []).map(Number).includes(svc.id)).slice(0, 3);
  const cases = (await getPublished("caseStudies")).filter((c) => (c.data.services || []).map(Number).includes(svc.id)).slice(0, 2);
  const faqs = (d.faq || []).filter((f: any) => f.q);
  const ld = await buildJsonLd({ type: svc.seo?.schemaType && svc.seo.schemaType !== "auto" ? svc.seo.schemaType : "Service", title: svc.title, description: d.summary, path: `/services/${svc.slug}`, image: mediaUrl(d.cover) || undefined,
    faqs: faqs.map((f: any) => ({ q: f.q, a: f.a })), steps: d.steps, crumbs: [{ name: "Services", path: "/services" }, { name: svc.seo?.breadcrumbTitle || svc.title, path: `/services/${svc.slug}` }] });
  const pk = await getPublished("packages");
  const offers = pk.filter((p) => Number(p.data.service) === svc.id && Number(p.data.price) > 0).map((p) => ({ "@type": "Offer", name: p.title, price: String(p.data.price), priceCurrency: p.data.currency || "USD" }));
  const main = ld["@graph"].find((n: any) => n["@id"]?.endsWith("#main")); if (main && offers.length && main["@type"] === "Service") main.offers = offers;
  const media = mediaUrl(d.media) || mediaUrl(d.cover);
  return (
    <>
      <JsonLd data={ld} />
      <DetailHero crumbs={[{ name: "Services", href: "/services" }, { name: svc.title }]} title={svc.title} sub={d.summary}>
        <div className="fade-in mt-9 flex flex-wrap gap-3" style={{ animationDelay: "200ms" }}>
          <Link href={st.identity.ctaHref || "/contact"} className="btn btn-primary">{st.identity.ctaLabel || "Get in touch"}</Link>
          {groups.length > 0 && <a href="#pricing" className="btn btn-ghost">See packages</a>}
        </div>
      </DetailHero>
      <section className="section !pt-6"><div className={`container-x grid gap-12 ${media ? "lg:grid-cols-[1.1fr_.9fr]" : ""}`}>
        <Reveal>{d.description && <div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.description) }} />}</Reveal>
        {media && <Reveal delay={100}><div className="glass overflow-hidden p-2"><Media src={media} alt={mediaAlt(d.media || d.cover, svc.title)} className="aspect-[16/10] w-full" /></div></Reveal>}
      </div></section>
      {(d.includes || []).length > 0 && <section className="section !pt-0"><div className="container-x"><h2 className="h-section mb-10">What&apos;s included</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{d.includes.map((x: any, i: number) => <Reveal key={i} delay={i * 50} className="glass p-6"><p className="font-semibold text-fg"><span className="mr-2 text-accent">✓</span>{x.title}</p>{x.text && <p className="mt-2 text-fg2">{x.text}</p>}</Reveal>)}</div>
      </div></section>}
      {(d.steps || []).length > 0 && <section className="section !pt-0"><div className="container-x"><h2 className="h-section mb-10">How it works</h2>
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{d.steps.map((x: any, i: number) => <Reveal as="li" key={i} delay={i * 80} className="glass p-6"><span className="font-mono text-sm text-accent">Step {i + 1}</span><h3 className="mt-3 text-xl font-semibold">{x.title}</h3>{x.text && <p className="mt-2 text-fg2">{x.text}</p>}</Reveal>)}</ol>
      </div></section>}
      {groups.length > 0 && <section id="pricing" className="section !pt-0 scroll-mt-24"><div className="container-x"><h2 className="h-section mb-10">Packages</h2><PricingTabs groups={groups} note={st.payments.note} ctaHref={st.identity.ctaHref || "/contact"} /></div></section>}
      {work.length > 0 && <section className="section !pt-0"><div className="container-x"><h2 className="h-section mb-10">Related work</h2><WorkGrid items={await workCards(work)} /></div></section>}
      {cases.length > 0 && <section className="section !pt-0"><div className="container-x"><h2 className="h-section mb-8">Case studies</h2><div className="grid gap-4 md:grid-cols-2">{cases.map((c) => <Link key={c.id} href={`/case-studies/${c.slug}`} className="card p-6 transition-colors hover:border-accent/50"><p className="text-sm text-muted">{c.data.client}</p><p className="mt-1 text-xl font-semibold">{c.title}</p></Link>)}</div></div></section>}
      {faqs.length > 0 && <section className="section !pt-0"><div className="container-x max-w-3xl"><h2 className="h-section mb-10">Questions about {svc.title.toLowerCase()}</h2><FaqList items={faqs.map((f: any) => ({ q: f.q, a: renderMarkdown(f.a || ""), group: "" }))} /></div></section>}
      <section className="section !pt-0"><div className="container-x"><div className="tex border border-line px-6 py-14 text-center" style={{ borderRadius: "var(--r-xl)", background: "radial-gradient(80% 120% at 50% 0%, rgb(var(--c-accent) / .2), transparent 70%), rgb(var(--c-surface))" }}>
        <h2 className="h-section">Ready to talk about {svc.title.toLowerCase()}?</h2><p className="lead mx-auto mt-4">We reply {st.identity.replyTime}.</p>
        <Link href={st.identity.ctaHref || "/contact"} className="btn btn-primary mt-8">{st.identity.ctaLabel || "Get in touch"}</Link>
      </div></div></section>
    </>
  );
}
