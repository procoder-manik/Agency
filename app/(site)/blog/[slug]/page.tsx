import Link from "next/link";
import { getPublishedBySlug, getPublished, type Entry } from "@/lib/content";
import { buildJsonLd, buildMetadata, ogFallback } from "@/lib/seo";
import { getAllSettings } from "@/lib/settings";
import { renderMarkdownToc } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { fmtDate } from "@/lib/util";
import { JsonLd, handleMissing } from "@/lib/page-render";
import { Crumbs } from "@/components/site/Detail";
import { Media } from "@/components/site/motion";
import { BlogList } from "@/components/site/Interactive";
import { postCards } from "@/components/site/Blocks";
import { Logo } from "@/components/site/Logo";
import { CtaCard, PostToc, PostTocMobile } from "@/components/site/PostToc";

type P = { params: { slug: string } };

export async function generateMetadata({ params }: P) {
  const p = await getPublishedBySlug("posts", params.slug); if (!p) return {};
  return buildMetadata({ title: p.title, description: p.data.excerpt, path: `/blog/${p.slug}`, seo: p.seo, image: mediaUrl(p.data.cover), ogLabel: p.data.kind === "update" ? "Update" : "Article", kind: "post", type: "article", publishedAt: p.publishedAt });
}

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const asIds = (v: any): number[] => (Array.isArray(v) ? v : v ? [v] : []).map(Number).filter(Boolean);

function Avatar({ m, size }: { m: Entry; size: number }) {
  const src = mediaUrl(m.data.photo);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={mediaAlt(m.data.photo, m.title)} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} /> : <span aria-hidden className="grid shrink-0 place-items-center rounded-full font-display font-bold text-onaccent" style={{ width: size, height: size, fontSize: size / 3, background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>{initials(m.title)}</span>;
}

export default async function PostPage({ params }: P) {
  const s = await getAllSettings();
  const p = await getPublishedBySlug("posts", params.slug);
  if (!p || !s.features.blog) return handleMissing(`/blog/${params.slug}`);
  const d = p.data;
  const [cats, team, posts] = await Promise.all([getPublished("categories"), getPublished("team"), getPublished("posts")]);
  const cat = cats.find((c) => c.id === Number(d.category));
  const authors = asIds(d.author).map((id) => team.find((t) => t.id === id)).filter(Boolean) as Entry[];
  const coverSrc = mediaUrl(d.cover);
  const cover = coverSrc || ogFallback(p.title, "post", d.kind === "update" ? "Update" : "Article");
  const { html, toc, words } = renderMarkdownToc(d.body || "");
  const minutes = Math.max(1, Math.round(words / 200));
  const sorted = [...posts].sort((a, b) => +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt));
  const idx = sorted.findIndex((x) => x.id === p.id);
  const newer = idx > 0 ? sorted[idx - 1] : null; const older = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const more = posts.filter((x) => x.id !== p.id && (!cat || Number(x.data.category) === cat.id)).slice(0, 3);
  const id = s.identity;
  const cta = { title: d.ctaTitle || "Need help with this?", text: d.ctaText || "Talk to our team about your website, SEO, marketing or automation project.", label: d.ctaLabel || id.ctaLabel || "Get in touch", href: d.ctaHref || id.ctaHref || "/contact" };
  const ld = await buildJsonLd({ type: p.seo?.schemaType && p.seo.schemaType !== "auto" ? p.seo.schemaType : "BlogPosting", title: p.title, description: d.excerpt, path: `/blog/${p.slug}`, image: cover, datePublished: p.publishedAt, dateModified: p.updatedAt, author: authors.map((a) => a.title), crumbs: [{ name: "Blog", path: "/blog" }, { name: p.seo?.breadcrumbTitle || p.title, path: `/blog/${p.slug}` }] });
  const navCard = (x: Entry, dir: "prev" | "next") => (
    <Link key={dir} href={`/blog/${x.slug}`} className={`card group flex flex-col p-6 transition-colors hover:border-accent/60 ${dir === "next" ? "sm:items-end sm:text-right" : ""}`}>
      <span className="mono-tag text-muted">{dir === "prev" ? "← Previous post" : "Next post →"}</span>
      <span className="mt-3 font-display text-xl font-semibold leading-snug transition-colors group-hover:text-accent">{x.title}</span>
      <span className="mt-2 text-sm text-fg2">{fmtDate(x.publishedAt || x.createdAt)}</span>
    </Link>
  );
  return (
    <>
      <JsonLd data={ld} />
      <article>
        <header className="tex relative overflow-hidden border-b border-line pb-32 pt-10 text-center sm:pb-44 sm:pt-14" style={{ background: "linear-gradient(180deg, rgb(var(--c-raised) / .85), rgb(var(--c-raised) / .35) 70%, rgb(var(--c-bg)))" }}>
          <div className="aurora opacity-60" aria-hidden><span /><span /><span /></div>
          <div className="container-x max-w-4xl">
            <Crumbs items={[{ name: "Blog", href: "/blog" }, { name: p.title }]} center />
            <div className="fade-in mono-tag flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-muted">
              {cat && <span className="chip !text-fg">{cat.title}</span>}<span>{fmtDate(p.publishedAt || p.createdAt)}</span><span aria-hidden>·</span><span>{minutes} min read</span>
            </div>
            <h1 className="fade-in mx-auto mt-6 max-w-4xl font-display text-[clamp(2.2rem,5.2vw,4.4rem)] font-bold leading-[1.04] tracking-tight" style={{ animationDelay: "80ms" }}>{p.title}</h1>
            {d.excerpt && <p className="lead fade-in mx-auto mt-6 !max-w-2xl" style={{ animationDelay: "160ms" }}>{d.excerpt}</p>}
            <div className="fade-in mt-8 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "240ms" }}>
              {authors.length > 0 ? authors.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-3"><Avatar m={a} size={40} /><span className="text-left"><span className="block text-sm font-semibold leading-tight text-fg">{a.title}</span>{a.data.role && <span className="block text-xs text-fg2">{a.data.role}</span>}</span></span>
              )) : <span className="text-sm text-fg2">By the {id.name} team</span>}
            </div>
          </div>
        </header>

        <div className="container-x relative z-10 -mt-24 max-w-5xl sm:-mt-32"><div className="glass overflow-hidden p-2"><Media src={coverSrc} poster={p.title} alt={mediaAlt(d.cover, p.title)} priority className="aspect-[16/9] w-full" /></div></div>

        <div className="container-x mt-14 grid max-w-6xl gap-14 pb-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <PostTocMobile items={toc} />
            <div id="post-body" className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: html }} />
            {(d.tags || []).length > 0 && <div className="mt-10 flex flex-wrap gap-2">{d.tags.map((t: string) => <span key={t} className="chip">#{t}</span>)}</div>}

            <div className="mt-12 lg:hidden"><CtaCard cta={cta} /></div>

            <section className="mt-14 space-y-4" aria-label="About the author">
              {authors.length > 0 ? authors.map((a) => (
                <div key={a.id} className="glass flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                  <Avatar m={a} size={88} />
                  <div className="min-w-0">
                    <p className="mono-tag text-muted">Written by</p>
                    <h2 className="mt-1 font-display text-2xl font-bold">{a.title}</h2>
                    {a.data.role && <p className="text-sm font-medium text-accent">{a.data.role}</p>}
                    {(a.data.longBio || a.data.bio) && <p className="mt-3 text-fg2">{String(a.data.longBio || a.data.bio).replace(/[#*_`>]/g, "")}</p>}
                    {(a.data.socials || []).length > 0 && <div className="mt-4 flex flex-wrap gap-4 text-sm">{a.data.socials.map((x: any) => <a key={x.url} href={x.url} target="_blank" rel="noopener" className="text-accent hover:underline">{x.label}</a>)}</div>}
                  </div>
                </div>
              )) : (
                <div className="glass flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
                  <Logo name={id.name} shortName={id.shortName} logo={id.logo} alt={id.logoAlt} compact />
                  <div><p className="mono-tag text-muted">Written by</p><h2 className="mt-1 font-display text-2xl font-bold">The {id.name} team</h2><p className="mt-2 text-fg2">{id.description}</p></div>
                </div>
              )}
            </section>

            {(older || newer) && <nav aria-label="More posts" className="mt-10 grid gap-4 sm:grid-cols-2"><div>{older && navCard(older, "prev")}</div><div>{newer && navCard(newer, "next")}</div></nav>}
          </div>
          <PostToc items={toc} cta={cta} />
        </div>
      </article>
      {more.length > 0 && <section className="section !pt-6"><div className="container-x"><h2 className="h-section mb-8">Keep reading</h2><BlogList items={await postCards(more)} /></div></section>}
      <div className="container-x pb-10"><Link href="/blog" className="btn btn-ghost">All posts</Link></div>
    </>
  );
}
