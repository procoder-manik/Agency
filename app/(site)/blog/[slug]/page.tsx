import Link from "next/link";
import { getPublishedBySlug, getPublished } from "@/lib/content";
import { buildJsonLd, buildMetadata, ogFallback } from "@/lib/seo";
import { getAllSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { fmtDate } from "@/lib/util";
import { JsonLd, handleMissing } from "@/lib/page-render";
import { Crumbs } from "@/components/site/Detail";
import { Media } from "@/components/site/motion";
import { BlogList } from "@/components/site/Interactive";
import { postCards } from "@/components/site/Blocks";

type P = { params: { slug: string } };

export async function generateMetadata({ params }: P) {
  const p = await getPublishedBySlug("posts", params.slug); if (!p) return {};
  return buildMetadata({ title: p.title, description: p.data.excerpt, path: `/blog/${p.slug}`, seo: p.seo, image: mediaUrl(p.data.cover), ogLabel: p.data.kind === "update" ? "Update" : "Article", kind: "post", type: "article", publishedAt: p.publishedAt });
}

export default async function PostPage({ params }: P) {
  const s = await getAllSettings();
  const p = await getPublishedBySlug("posts", params.slug);
  if (!p || !s.features.blog) return handleMissing(`/blog/${params.slug}`);
  const d = p.data;
  const [cats, team, posts] = await Promise.all([getPublished("categories"), getPublished("team"), getPublished("posts")]);
  const cat = cats.find((c) => c.id === Number(d.category));
  const author = team.find((t) => t.id === Number(d.author));
  const coverSrc = mediaUrl(d.cover);
  const cover = coverSrc || ogFallback(p.title, "post", d.kind === "update" ? "Update" : "Article");
  const more = posts.filter((x) => x.id !== p.id && (!cat || Number(x.data.category) === cat.id)).slice(0, 3);
  const ld = await buildJsonLd({ type: p.seo?.schemaType && p.seo.schemaType !== "auto" ? p.seo.schemaType : "BlogPosting", title: p.title, description: d.excerpt, path: `/blog/${p.slug}`, image: cover, datePublished: p.publishedAt, dateModified: p.updatedAt, author: author?.title, crumbs: [{ name: "Blog", path: "/blog" }, { name: p.seo?.breadcrumbTitle || p.title, path: `/blog/${p.slug}` }] });
  return (
    <>
      <JsonLd data={ld} />
      <article>
        <header className="container-x max-w-3xl pt-12 sm:pt-16">
          <Crumbs items={[{ name: "Blog", href: "/blog" }, { name: p.title }]} />
          <p className="text-fg2">{[cat?.title, fmtDate(p.publishedAt || p.createdAt)].filter(Boolean).join(", ")}</p>
          <h1 className="fade-in mt-3 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.05] tracking-tight">{p.title}</h1>
          {d.excerpt && <p className="lead mt-5">{d.excerpt}</p>}
          {author && <p className="mt-6 text-fg2">By <span className="text-fg">{author.title}</span>{author.data.role ? `, ${author.data.role}` : ""}</p>}
        </header>
        <div className="container-x mt-10 max-w-5xl"><div className="glass overflow-hidden p-2"><Media src={coverSrc} poster={p.title} alt={mediaAlt(d.cover, p.title)} priority className="aspect-[16/9] w-full" /></div></div>
        <div className="container-x max-w-3xl py-14"><div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.body || "") }} />
          {(d.tags || []).length > 0 && <div className="mt-10 flex flex-wrap gap-2">{d.tags.map((t: string) => <span key={t} className="chip">#{t}</span>)}</div>}
          {author && <div className="glass mt-12 flex items-center gap-4 p-6">
            {mediaUrl(author.data.photo) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={mediaUrl(author.data.photo)} alt={author.title} className="h-14 w-14 rounded-full object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-full bg-raised font-display font-bold text-accent">{author.title.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}
            <div><p className="font-semibold">{author.title}</p><p className="text-sm text-fg2">{author.data.bio || author.data.role}</p></div>
          </div>}
        </div>
      </article>
      {more.length > 0 && <section className="section !pt-0"><div className="container-x"><h2 className="h-section mb-8">Keep reading</h2><BlogList items={await postCards(more)} /></div></section>}
      <div className="container-x pb-10"><Link href="/blog" className="btn btn-ghost">All posts</Link></div>
    </>
  );
}
