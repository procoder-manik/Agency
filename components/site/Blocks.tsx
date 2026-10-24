import Link from "next/link";
import type { Block } from "@/lib/blocks";
import { getPublished, type Entry } from "@/lib/content";
import { getAllSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { renderMustache, scopeCss } from "@/lib/mustache";
import { hash } from "@/lib/templating";
import { resolveCategory } from "@/lib/portfolio";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { fmtDate, formatPrice } from "@/lib/util";
import { Counter, Media, Reveal, Tilt } from "./motion";
import { ClipReveal, HeroCanvas, Magnetic, RotatingBadge, ScrambleText, SplitText } from "./fx";
import { ServiceRows, StepsProgress, TestimonialSlider } from "./Showcase";
import { CardLayout } from "./CardLayout";
import { BlogList, ContactForm, FaqList, LocationsGrid, PricingTabs, WorkGrid } from "./Interactive";

type D = Record<string, any>;
const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

function Head({ d, center = false, className = "" }: { d: D; center?: boolean; className?: string }) {
  if (!d.heading && !d.intro) return null;
  const n = typeof d._n === "number" ? String(d._n).padStart(2, "0") : "";
  return (
    <div className={`mb-14 max-w-4xl sm:mb-20 ${center ? "mx-auto text-center" : ""} ${className}`}>
      {(d.eyebrow || n) && <div className={`section-tag mono-tag ${center ? "justify-center" : ""}`}>{n && <span className="idx">[ {n} ]</span>}{d.eyebrow && <ScrambleText text={String(d.eyebrow)} />}</div>}
      {d.heading && <SplitText text={d.heading} as="h2" className="h-section" />}
      {d.intro && <Reveal delay={150}><p className={`lead mt-6 ${center ? "mx-auto" : ""}`}>{d.intro}</p></Reveal>}
    </div>
  );
}
const Btn = ({ label, href, primary }: { label?: string; href?: string; primary?: boolean }) =>
  label && href ? <Magnetic strength={0.22}><Link href={href} className={`btn ${primary ? "btn-primary" : "btn-ghost"}`}>{label}<span className="arrow" aria-hidden>→</span></Link></Magnetic> : null;

/* ---------------- individual blocks ---------------- */
function Hero({ d, first }: { d: D; first: boolean }) {
  const src = mediaUrl(d.media);
  const bg = d.mediaMode === "background" && src;
  const words = String(d.heading || "").split(/\s+/).filter(Boolean);
  const Tag = first ? "h1" : "h2";
  const grad = words.length > 3 ? words.length - 2 : words.length - 1;
  const delay = (n: number) => `${200 + n * 70}ms`;
  return (
    <section className={`tex relative overflow-hidden ${first ? "pb-24 pt-8 sm:pb-36 sm:pt-16" : "section"}`}>
      <HeroCanvas />
      {bg && <div className="absolute inset-0 -z-10 opacity-40"><Media src={src} alt="" priority className="h-full w-full" /><div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" /></div>}
      <div className="container-x">
        <div className={`grid items-end gap-14 ${src && !bg ? "lg:grid-cols-[1.3fr_.7fr]" : ""}`}>
          <div>
            {(first && d._status) || arr(d.badges).length > 0 ? (
              <div className="fade-in mb-8 flex flex-wrap items-center gap-2" style={{ animationDelay: "100ms" }}>
                {first && d._status && <span className="chip mono-tag !border-success/40 !text-fg"><span className="pulse-dot" />{d._status}</span>}
                {arr(d.badges).map((b: string) => <span key={b} className="chip mono-tag">{b}</span>)}
              </div>
            ) : null}
            <Tag className={first ? "h-display" : "h-section"} aria-label={d.heading}>
              {words.map((w, i) => <span key={i} className="word" aria-hidden><span className={i >= grad ? "text-gradient" : ""} style={{ animationDelay: delay(i) }}>{w}</span>{i < words.length - 1 ? "\u00a0" : ""}</span>)}
            </Tag>
            <div className="mt-10 flex flex-col gap-10 sm:mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                {d.subheading && <p className="lead fade-in" style={{ animationDelay: delay(words.length + 1) }}>{d.subheading}</p>}
                {(d.primaryLabel || d.secondaryLabel) && (
                  <div className="fade-in mt-9 flex flex-wrap gap-3" style={{ animationDelay: delay(words.length + 3) }}>
                    <Btn label={d.primaryLabel} href={d.primaryHref} primary /><Btn label={d.secondaryLabel} href={d.secondaryHref} />
                  </div>
                )}
              </div>
              {first && !src && d.primaryHref && <div className="fade-in hidden sm:block" style={{ animationDelay: delay(words.length + 5) }}><RotatingBadge text={d.primaryLabel || "Let's talk"} href={d.primaryHref} /></div>}
            </div>
          </div>
          {src && !bg && (
            <div className="fade-in relative" style={{ animationDelay: "500ms" }}>
              <div aria-hidden className="orbit -right-10 -top-10 h-[120%] w-[120%] opacity-70" style={{ left: "-10%" }} />
              <div aria-hidden className="orbit rev left-[8%] top-[8%] h-[84%] w-[84%] opacity-60" />
              <Tilt className="hud !bg-surface/40 p-2"><Media src={src} alt={mediaAlt(d.media, d.heading)} priority className="aspect-[4/5] w-full" cover /></Tilt>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Split({ d }: { d: D }) {
  const src = mediaUrl(d.media);
  return (
    <section className="section">
      <div className={`container-x grid items-center gap-14 ${src ? "lg:grid-cols-2" : ""}`}>
        <div className={d.reverse ? "lg:order-2" : ""}>
          {d.heading && <SplitText text={d.heading} as="h2" className="h-section" />}
          {d.body && <Reveal delay={120}><div className="prose-site mt-8 text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.body) }} /></Reveal>}
          {d.linkLabel && <Reveal delay={200}><div className="mt-10"><Btn label={d.linkLabel} href={d.linkHref} /></div></Reveal>}
        </div>
        {src && <ClipReveal className={`hud ${d.reverse ? "lg:order-1" : ""} !rounded-[var(--r-xl)]`}><Media src={src} alt={mediaAlt(d.media, d.heading)} className="aspect-[4/3] w-full" /></ClipReveal>}
      </div>
    </section>
  );
}

const RichText = ({ d, first }: { d: D; first: boolean }) => (
  <section className={first ? "pb-20 pt-16 sm:pt-24" : "section"}><div className="container-x"><Reveal>
    {d.heading && (first ? <h1 className="h-section mb-6">{d.heading}</h1> : <h2 className="h-section mb-6">{d.heading}</h2>)}
    <div className="prose-site text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.body || "") }} />
  </Reveal></div></section>
);

const Cards = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x"><Head d={d} />
    <CardLayout layout={d.layout} auto={d.carouselMotion !== "manual"} perView={4} gridClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" items={
      arr(d.items).map((c, i) => {
        const inner = (<>
          {mediaUrl(c.image) && <div className="-mx-7 -mt-7 mb-6 aspect-[4/3] overflow-hidden border-b border-line"><Media src={mediaUrl(c.image)} alt={mediaAlt(c.image, c.title)} className="h-full w-full" /></div>}
          <span aria-hidden className="mono-tag grid h-11 w-11 place-items-center rounded-full border border-line text-base text-accent transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-onaccent">{c.icon || String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-8 text-xl font-semibold leading-snug">{c.title}</h3>
          {c.text && <p className="mt-3 text-[0.95rem] text-fg2">{c.text}</p>}
          {c.href && <span className="mt-auto pt-6 text-sm font-medium text-accent">Explore <span aria-hidden className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span></span>}
        </>);
        return <Reveal key={i} delay={(i % 4) * 70} className="h-full"><Tilt className="group h-full">{c.href ? <Link href={c.href} className="flex h-full flex-col p-7">{inner}</Link> : <div className="flex h-full flex-col p-7">{inner}</div>}</Tilt></Reveal>;
      })} />
  </div></section>
);

const Highlights = ({ d }: { d: D }) => (
  <section className="py-12 sm:py-16"><div className="container-x">
    <div className="grid grid-cols-2 gap-y-10 border-y border-line py-10 lg:grid-cols-4">
      {arr(d.items).map((h, i) => (
        <Reveal key={i} delay={i * 80} className="px-4 lg:border-l lg:border-line lg:px-8 lg:first:border-0 lg:first:pl-0">
          <p className="text-gradient font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.12] tracking-tight">{h.value}</p>
          <p className="mt-3 font-semibold text-fg">{h.title}</p>
          {h.text && <p className="mt-1.5 text-sm text-fg2">{h.text}</p>}
        </Reveal>
      ))}
    </div>
  </div></section>
);

const Features = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
    <Head d={d} className="!mb-0 lg:sticky lg:top-32 lg:self-start" />
    <div className="divide-y divide-line border-y border-line">
      {arr(d.items).map((f, i) => (
        <Reveal key={i} delay={i * 50} className="grid gap-3 py-8 sm:grid-cols-[84px_1fr]">
          <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
          <div><h3 className="h-card">{f.title}</h3>{f.text && <p className="mt-3 text-lg text-fg2">{f.text}</p>}</div>
        </Reveal>
      ))}
    </div>
  </div></section>
);

function Steps({ d }: { d: D }) {
  const src = mediaUrl(d.media);
  return (
    <section className="section"><div className="container-x grid gap-16 lg:grid-cols-[.8fr_1.2fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Head d={d} className="!mb-8" />
        {src && <ClipReveal className="!rounded-[var(--r-xl)]"><Media src={src} alt={mediaAlt(d.media, d.heading)} className="aspect-[4/3] w-full" /></ClipReveal>}
      </div>
      <StepsProgress items={arr(d.items).map((x) => ({ title: x.title, text: x.text }))} />
    </div></section>
  );
}

const Stats = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x"><Head d={d} />
    <div className="grid grid-cols-2 gap-y-14 border-t border-line pt-14 lg:grid-cols-4">
      {arr(d.items).map((s, i) => (
        <Reveal key={i} delay={i * 90} className="pr-6 lg:border-l lg:border-line lg:pl-8 lg:first:border-0 lg:first:pl-0">
          <p className="font-display text-[clamp(3.2rem,7.5vw,7rem)] font-bold leading-[1.08] tracking-tighter"><Counter value={Number(s.value) || 0} suffix={s.suffix || ""} /></p>
          <p className="mt-4 text-fg2">{s.label}</p>
        </Reveal>
      ))}
    </div>
  </div></section>
);

const Timeline = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x max-w-3xl"><Head d={d} />
    <ol className="relative border-l border-line pl-8">
      {arr(d.items).map((t, i) => (
        <Reveal as="li" key={i} delay={i * 60} className="relative pb-10 last:pb-0">
          <span aria-hidden className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-bg" />
          <p className="font-mono text-sm text-accent">{t.date}</p><h3 className="mt-1 text-xl font-semibold">{t.title}</h3>{t.text && <p className="mt-2 text-fg2">{t.text}</p>}
        </Reveal>
      ))}
    </ol>
  </div></section>
);

async function Faq({ d }: { d: D }) {
  const items = await faqItems(d);
  return (
    <section className="section"><div className={`container-x ${d.searchable ? "" : "max-w-3xl"}`}><Head d={d} />
      <FaqList items={items.map((i) => ({ q: i.q, a: renderMarkdown(i.a), group: i.group }))} searchable={!!d.searchable} />
    </div></section>
  );
}
export async function faqItems(d: D) {
  if (d.source === "manual") return arr(d.items).filter((i) => i.q).map((i) => ({ q: i.q, a: i.a || "", group: "" }));
  const all = await getPublished("faqs");
  const help = d.group === "__help";
  let list = all.filter((f) => (help ? f.data.showInHelp : f.data.showOnFaq !== false));
  if (d.group && !help) list = list.filter((f) => (f.data.category || "").toLowerCase() === String(d.group).toLowerCase());
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  return list.map((f) => ({ q: f.title, a: f.data.answer || "", group: f.data.category || "General" }));
}

const Cta = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x"><Reveal>
    <div className="relative overflow-hidden px-6 py-20 text-onaccent sm:px-16 sm:py-32" style={{ borderRadius: "var(--r-xl)", background: "linear-gradient(125deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>
      <div aria-hidden className="float absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
      <SplitText text={d.heading || ""} as="h2" className="relative max-w-5xl !text-onaccent [font-size:clamp(2.6rem,7.4vw,7rem)] font-bold leading-[1.02] tracking-[-0.04em]" />
      {d.text && <p className="relative mt-8 max-w-xl text-xl opacity-90">{d.text}</p>}
      <div className="relative mt-12 flex flex-wrap gap-3">
        {d.primaryLabel && d.primaryHref && <Magnetic strength={0.25}><Link href={d.primaryHref} className="btn !bg-bg !text-fg hover:!shadow-2xl">{d.primaryLabel}<span className="arrow" aria-hidden>→</span></Link></Magnetic>}
        {d.secondaryLabel && d.secondaryHref && <Link href={d.secondaryHref} className="btn border border-onaccent/50 !text-onaccent hover:bg-white/10">{d.secondaryLabel}</Link>}
      </div>
    </div>
  </Reveal></div></section>
);

function Marquee({ d }: { d: D }) {
  const items = arr(d.items); if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <section className="overflow-hidden py-14 sm:py-20">
      {d.heading && <p className="container-x kicker mb-8">{d.heading}</p>}
      <div className="marquee" aria-label={d.heading || "Clients"}>
        <ul className="marquee-track items-center gap-14 px-7" style={{ ["--speed" as any]: "55s" }}>
          {row.map((l, i) => (
            <li key={i} aria-hidden={i >= items.length} className="flex shrink-0 items-center gap-14">
              {mediaUrl(l.logo) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={mediaUrl(l.logo)} alt={mediaAlt(l.logo, l.label)} className="h-10 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" loading="lazy" />
                : <span className={`font-display text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[1.12] tracking-tight ${i % 2 ? "text-outline" : "text-fg"}`}>{l.label}</span>}
              <span aria-hidden className="text-2xl text-accent">✦</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const Gallery = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x"><Head d={d} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {arr(d.items).map((g, i) => (
        <Reveal key={i} delay={i * 50}><figure className="glass overflow-hidden p-1.5">
          <Media src={mediaUrl(g.image)} alt={mediaAlt(g.image, g.caption)} className="aspect-[4/3] w-full" />
          {g.caption && <figcaption className="px-2 py-2 text-sm text-fg2">{g.caption}</figcaption>}
        </figure></Reveal>
      ))}
    </div>
  </div></section>
);

const Video = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x max-w-5xl"><Head d={d} />
    <Reveal><figure className="glass overflow-hidden p-2"><Media src={mediaUrl(d.media)} alt={mediaAlt(d.media, d.caption || d.heading)} className="aspect-video w-full" />
      {d.caption && <figcaption className="px-3 py-3 text-sm text-fg2">{d.caption}</figcaption>}</figure></Reveal>
  </div></section>
);

async function Services({ d }: { d: D }) {
  const list = await getPublished("services");
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <ServiceRows items={list.map((s) => ({ id: s.id, title: s.title, href: `/services/${s.slug}`, summary: s.data.summary || "", icon: s.data.icon || "", img: mediaUrl(s.data.cover) || mediaUrl(s.data.media) }))} />
    </div></section>
  );
}

export async function workCards(list: Entry[]) {
  const [services, st, terms] = await Promise.all([getPublished("services"), getAllSettings(), getPublished("projectCategories")]);
  const cats = st.portfolio.categories;
  return list.map((p) => ({
    id: p.id, title: p.title, href: `/${st.portfolio.base}/${p.slug}`, client: p.data.client || "",
    category: resolveCategory(p.data.category, terms, cats).name, accent: p.data.accent || resolveCategory(p.data.category, terms, cats).color || "",
    tags: (Array.isArray(p.data.tags) ? p.data.tags : []) as string[],
    img: mediaUrl(p.data.scrollImage) || mediaUrl(p.data.screenshot) || mediaUrl(p.data.cover),
    alt: mediaAlt(p.data.scrollImage || p.data.screenshot, `${p.title} website screenshot`), industry: p.data.industry || "",
    direction: p.data.scrollDirection === "up" ? "up" : "down", platform: p.data.platform || "", technologies: (Array.isArray(p.data.technologies) ? p.data.technologies : []) as string[],
    liveUrl: p.data.liveUrl || "", tall: !!mediaUrl(p.data.scrollImage),
    services: (Array.isArray(p.data.services) ? p.data.services : []).map((id: any) => services.find((s) => s.id === Number(id))?.title).filter(Boolean) as string[],
    status: p.data.workStatus || "completed", summary: p.data.summary || "",
  }));
}

async function Work({ d }: { d: D }) {
  let list = await getPublished("projects");
  if (d.featuredOnly) list = list.filter((p) => p.featured);
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return <section className="section"><div className="container-x"><Head d={d} /><WorkGrid items={await workCards(list)} filters={!!d.filters} layout={d.layout} auto={d.carouselMotion !== "manual"} /></div></section>;
}

async function CaseStudies({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.caseStudies) return null;
  let list = await getPublished("caseStudies");
  list = [...list.filter((c) => c.featured), ...list.filter((c) => !c.featured)];
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  const [first, ...rest] = list;
  const img = (c: Entry) => mediaUrl(c.data.cover);
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <Reveal><Link href={`/case-studies/${first.slug}`} className="card group grid overflow-hidden md:grid-cols-[1fr_1.1fr]">
        <div className="aspect-[4/5] overflow-hidden bg-raised md:aspect-auto"><Media src={img(first)} poster={first.title} alt={mediaAlt(first.data.cover, first.title)} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <p className="text-fg2">{[first.data.client, first.data.industry].filter(Boolean).join(", ")}</p>
          <h3 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{first.title}</h3>
          {first.data.summary && <p className="mt-4 text-lg text-fg2">{first.data.summary}</p>}
          {arr(first.data.results).length > 0 && <div className="mt-8 flex flex-wrap gap-8">{arr(first.data.results).slice(0, 3).map((r, i) => <div key={i}><p className="font-display text-3xl font-bold text-accent">{r.value}</p><p className="text-sm text-fg2">{r.label}</p></div>)}</div>}
          <span className="mt-8 font-medium text-accent">Read the case study</span>
        </div>
      </Link></Reveal>
      {rest.length > 0 && <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((c, i) => (
          <Reveal key={c.id} delay={i * 70}><Link href={`/case-studies/${c.slug}`} className="card group block h-full">
            <div className="aspect-[4/3] overflow-hidden bg-raised"><Media src={img(c)} poster={c.title} alt={mediaAlt(c.data.cover, c.title)} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
            <div className="p-6"><p className="text-sm text-muted">{c.data.client}</p><h3 className="mt-1 text-xl font-semibold">{c.title}</h3></div>
          </Link></Reveal>
        ))}
      </div>}
    </div></section>
  );
}

export async function postCards(list: Entry[]) {
  const [cats, team] = await Promise.all([getPublished("categories"), getPublished("team")]);
  return list.map((p) => {
    const cat = cats.find((c) => c.id === Number(p.data.category));
    return {
      id: p.id, title: p.title, href: `/blog/${p.slug}`, img: mediaUrl(p.data.cover),
      alt: mediaAlt(p.data.cover, p.title), excerpt: p.data.excerpt || "",
      category: cat ? { id: cat.id, slug: cat.slug, title: cat.title, color: cat.data.color as string | undefined } : undefined,
      date: fmtDate(p.publishedAt || p.createdAt), author: team.find((t) => t.id === Number(Array.isArray(p.data.author) ? p.data.author[0] : p.data.author))?.title || "", kind: p.data.kind || "article",
    };
  });
}

async function Blog({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.blog) return null;
  let list = await getPublished("posts");
  list = [...list].sort((a, b) => +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt));
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return <section className="section"><div className="container-x"><Head d={d} /><BlogList items={await postCards(list)} filters={!!d.filters} layout={d.layout} auto={d.carouselMotion !== "manual"} /></div></section>;
}

export async function pricingGroups(serviceId?: number) {
  const [services, packages] = await Promise.all([getPublished("services"), getPublished("packages")]);
  return services.filter((s) => !serviceId || s.id === serviceId).map((s) => ({
    service: s.title, href: `/services/${s.slug}`,
    packages: packages.filter((p) => Number(p.data.service) === s.id).map((p) => ({
      id: p.id, name: p.title, price: formatPrice(p.data.price, p.data.currency || "USD"), range: p.data.priceMax ? formatPrice(p.data.priceMax, p.data.currency || "USD") : undefined,
      billing: p.data.billing === "monthly" ? "per month" : p.data.billing === "yearly" ? "per year" : "one-time", delivery: p.data.delivery || "", summary: p.data.summary || "",
      features: arr(p.data.features), highlight: !!p.data.highlight,
    })),
  })).filter((g) => g.packages.length);
}

async function Pricing({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.pricing) return null;
  const groups = await pricingGroups(d.service ? Number(d.service) : undefined);
  if (d.teaser) {
    const pk = groups.flatMap((g) => g.packages.map((p) => ({ ...p, service: g.service }))).slice(0, 3);
    if (!pk.length) return null;
    return (
      <section className="section"><div className="container-x"><Head d={d} />
        <div className="grid gap-5 md:grid-cols-3">
          {pk.map((p, i) => <Reveal key={p.id} delay={i * 70}><div className={`card h-full p-7 ${p.highlight ? "!border-accent/70" : ""}`}>
            <p className="text-sm text-muted">{p.service}</p><h3 className="mt-1 text-xl font-semibold">{p.name}</h3>
            <p className="mt-5 font-display text-3xl font-bold">{p.price || "Custom"}{p.range && <span className="text-xl text-fg2"> to {p.range}</span>}</p><p className="text-sm text-muted">{p.billing}</p>
          </div></Reveal>)}
        </div>
        <div className="mt-8"><Btn label="See all pricing" href="/pricing" /></div>
      </div></section>
    );
  }
  return <section className="section"><div className="container-x"><Head d={d} /><PricingTabs groups={groups} note={s.payments.note + (s.payments.methods?.length ? ` Payment methods: ${s.payments.methods.join(", ")}.` : "")} ctaHref={s.identity.ctaHref || "/contact"} /></div></section>;
}

async function Testimonials({ d }: { d: D }) {
  let list = await getPublished("testimonials"); if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return (
    <section className="section"><div className="container-x grid gap-14 lg:grid-cols-[.45fr_1fr]">
      <Head d={d} className="!mb-0" />
      <TestimonialSlider items={list.map((t) => ({ quote: t.data.quote || "", name: t.title, role: [t.data.role, t.data.company].filter(Boolean).join(", "), photo: mediaUrl(t.data.photo), alt: mediaAlt(t.data.photo, t.title) }))} />
    </div></section>
  );
}

async function Team({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.team) return null;
  let list = await getPublished("team"); if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <CardLayout layout={d.layout} auto={d.carouselMotion !== "manual"} perView={4} gridClass="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" items={
        list.map((m, i) => (
          <Reveal key={m.id} delay={i * 70} className="h-full"><Tilt className="h-full">
            <div className="aspect-square overflow-hidden bg-raised">
              {mediaUrl(m.data.photo) ? <Media src={mediaUrl(m.data.photo)} alt={mediaAlt(m.data.photo, m.title)} className="h-full w-full" />
                : <div className="grid h-full place-items-center font-display text-5xl font-bold text-accent" aria-hidden>{m.title.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold">{m.title}</h3><p className="text-fg2">{m.data.role}</p>
              {m.data.bio && <p className="mt-3 text-sm text-fg2">{m.data.bio}</p>}
              {arr(m.data.skills).length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{arr(m.data.skills).slice(0, 4).map((k: string) => <span key={k} className="chip">{k}</span>)}</div>}
              {arr(m.data.socials).length > 0 && <div className="mt-3 flex gap-3 text-sm">{arr(m.data.socials).map((x: any) => <a key={x.url} href={x.url} target="_blank" rel="noopener" className="text-accent hover:underline">{x.label}</a>)}</div>}
            </div>
          </Tilt></Reveal>
        ))} />
    </div></section>
  );
}

async function Contact({ d }: { d: D }) {
  const s = await getAllSettings();
  const forms = await getPublished("forms");
  const form = (d.form && forms.find((f) => f.id === Number(d.form))) || forms.find((f) => f.slug === "contact") || forms[0];
  const id = s.identity;
  const fields = arr(form?.data.fields).length ? arr(form!.data.fields) : [{ name: "name", label: "Name", type: "text", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }];
  return (
    <section className="section"><div className={`container-x grid gap-12 ${d.details ? "lg:grid-cols-[1fr_1.4fr]" : "max-w-3xl"}`}>
      <div>
        {d.heading && <h2 className="h-section">{d.heading}</h2>}
        {d.text && <p className="lead mt-4">{d.text}</p>}
        {d.details && (
          <dl className="mt-8 space-y-5 text-fg2">
            {id.email && <div><dt className="text-sm text-muted">Email</dt><dd><a className="text-lg text-fg hover:text-accent" href={`mailto:${id.email}`}>{id.email}</a></dd></div>}
            {id.phone && <div><dt className="text-sm text-muted">Phone</dt><dd><a className="text-lg text-fg hover:text-accent" href={`tel:${id.phone.replace(/\s/g, "")}`}>{id.phone}</a></dd></div>}
            {id.whatsapp && <div><dt className="text-sm text-muted">WhatsApp</dt><dd><a className="text-lg text-fg hover:text-accent" href={`https://wa.me/${id.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener">{id.whatsapp}</a></dd></div>}
            <div><dt className="text-sm text-muted">Where we work</dt><dd className="text-fg">{id.address || "Remotely, with clients across time zones"}</dd></div>
            {id.hours && <div><dt className="text-sm text-muted">Hours</dt><dd className="text-fg">{id.hours}</dd></div>}
            {id.replyTime && <div><dt className="text-sm text-muted">Response time</dt><dd className="text-fg">We reply {id.replyTime}.</dd></div>}
          </dl>
        )}
      </div>
      <div className="glass p-6 sm:p-8"><ContactForm formId={form?.id ?? null} fields={fields} success={form?.data.successMessage || "Thanks! We'll be in touch soon."} style={form?.data.style} layout={form?.data.layout} submitLabel={form?.data.submitLabel} /></div>
    </div></section>
  );
}


/* ---------------- advanced layout modules ---------------- */
function Bento({ d }: { d: D }) {
  const items = arr(d.items); if (!items.length) return null;
  const pattern = ["md", "md", "sm", "sm", "sm", "md", "md", "sm", "sm", "sm"];
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <div className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)]">
        {items.map((it, i) => {
          const size = it.size || pattern[i % pattern.length];
          const span = size === "lg" ? "md:col-span-3 md:row-span-2" : size === "md" ? "md:col-span-3" : "md:col-span-2";
          const inner = (<>
            <span aria-hidden className="mono-tag grid h-11 w-11 place-items-center rounded-full border border-line text-base text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-onaccent">{it.icon || String(i + 1).padStart(2, "0")}</span>
            <div className="mt-auto pt-10"><h3 className="h-card">{it.title}</h3>{it.text && <p className="mt-3 text-fg2">{it.text}</p>}</div>
          </>);
          return <Reveal key={i} delay={(i % 4) * 70} className={span}><Tilt className="group flex h-full min-h-[200px] flex-col p-7">{it.href ? <Link href={it.href} className="flex h-full flex-col">{inner}</Link> : <div className="flex h-full flex-col">{inner}</div>}</Tilt></Reveal>;
        })}
      </div>
    </div></section>
  );
}

function Platforms({ d }: { d: D }) {
  const items = arr(d.items); if (!items.length) return null;
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <CardLayout layout={d.layout} auto={d.carouselMotion !== "manual"} perView={3} gridClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" items={
        items.map((p, i) => {
          const inner = (<>
            <div className="flex items-start justify-between gap-4">
              <span aria-hidden className="grid h-14 w-14 place-items-center font-display text-lg font-bold text-onaccent" style={{ borderRadius: "var(--r-md)", background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>{String(p.name || "?").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase()}</span>
              {p.tag && <span className="chip mono-tag">{p.tag}</span>}
            </div>
            <h3 className="h-card mt-8">{p.name}</h3>
            {p.text && <p className="mt-3 text-fg2">{p.text}</p>}
            {p.href && <span className="mt-auto pt-6 font-medium text-accent">Learn more <span aria-hidden>→</span></span>}
          </>);
          return <Reveal key={i} delay={(i % 3) * 80} className="h-full"><Tilt className="h-full">{p.href ? <Link href={p.href} className="flex h-full flex-col p-7">{inner}</Link> : <div className="flex h-full flex-col p-7">{inner}</div>}</Tilt></Reveal>;
        })} />
    </div></section>
  );
}

function Compare({ d }: { d: D }) {
  const cols: string[] = arr(d.columns); const rows = arr(d.rows); if (!cols.length || !rows.length) return null;
  const cell = (v: any) => { const t = String(v ?? "").trim(); if (/^(yes|y|✓|true)$/i.test(t)) return <span className="text-success" aria-label="Yes">✓</span>; if (/^(no|n|-|x|✕|false)$/i.test(t)) return <span className="text-muted" aria-label="No">–</span>; return t; };
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <Reveal><div className="glass overflow-x-auto" data-lenis-prevent-wheel>
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
          <thead><tr><th scope="col" className="p-5 text-sm font-medium text-muted"><span className="sr-only">Feature</span></th>
            {cols.map((c) => <th key={c} scope="col" className={`p-5 font-display text-lg font-semibold ${c === d.highlight ? "bg-accent/10 text-fg" : "text-fg"}`} style={c === d.highlight ? { boxShadow: "inset 0 3px 0 rgb(var(--c-accent))" } : undefined}>{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}><th scope="row" className="border-t border-line p-5 text-sm font-medium text-fg2">{r.label}</th>
              {cols.map((c, j) => <td key={c} className={`border-t border-line p-5 text-[0.95rem] text-fg ${c === d.highlight ? "bg-accent/10" : ""}`}>{cell(arr(r.values)[j])}</td>)}</tr>
          ))}</tbody>
        </table>
      </div></Reveal>
    </div></section>
  );
}

async function Locations({ d }: { d: D }) {
  const pages = (await getPublished("pages")).filter((p) => p.data.location && !p.data.template);
  if (!pages.length) return null;
  let list = pages.map((p) => ({ title: p.title, href: `/${p.slug}`, service: p.data.location.service || "", industry: p.data.location.industry || "", city: p.data.location.label || p.data.location.city || "" }));
  if (Number(d.limit) > 0 && !d.filters) list = list.slice(0, Number(d.limit));
  return <section className="section"><div className="container-x"><Head d={d} /><LocationsGrid items={list} filters={!!d.filters} /></div></section>;
}

function HtmlBlock({ d }: { d: D }) {
  const html = String(d.html || "").replace(/<script[\s\S]*?<\/script>/gi, ""); if (!html.trim()) return null;
  const id = "h" + hash(html + (d.css || "")).toString(36);
  const css = d.css ? scopeCss(String(d.css), "#" + id) : "";
  const body = (<div id={id}>{css && <style dangerouslySetInnerHTML={{ __html: css }} />}<div dangerouslySetInnerHTML={{ __html: html }} /></div>);
  return d.fullWidth ? body : <section className="section"><div className="container-x">{body}</div></section>;
}

async function ModuleBlock({ d }: { d: D }) {
  const mods = await getPublished("modules");
  const m = mods.find((x) => x.id === Number(d.module)); if (!m) return null;
  const defs: any[] = arr(m.data.fields); const vals: Record<string, any> = d.values || {};
  const ctx: Record<string, any> = {};
  for (const f of defs) {
    const v = vals[f.name];
    if (f.type === "markdown") ctx[f.name] = renderMarkdown(String(v || ""));
    else if (f.type === "image") ctx[f.name] = mediaUrl(v);
    else if (f.type === "list") ctx[f.name] = arr(v).map((it: any) => Object.fromEntries(Object.entries(it || {}).map(([k, x]) => [k, mediaUrl(x as any) || x])));
    else if (f.type === "tags") ctx[f.name] = arr(v);
    else ctx[f.name] = v ?? "";
  }
  const id = "m" + m.id + "-" + (hash(JSON.stringify(vals)) % 99999).toString(36);
  const html = renderMustache(String(m.data.html || ""), ctx).replace(/<script[\s\S]*?<\/script>/gi, "");
  const css = m.data.css ? scopeCss(String(m.data.css), "#" + id) : "";
  return <section className="section"><div className="container-x"><div id={id}>{css && <style dangerouslySetInnerHTML={{ __html: css }} />}<div dangerouslySetInnerHTML={{ __html: html }} /></div></div></section>;
}

/* ---------------- renderer ---------------- */
const MAP: Record<string, (p: { d: D; first: boolean }) => any> = {
  hero: Hero, richtext: RichText, split: Split, cards: Cards, features: Features, steps: Steps, stats: Stats, timeline: Timeline,
  faq: Faq, cta: Cta, marquee: Marquee, gallery: Gallery, video: Video, services: Services, work: Work, casestudies: CaseStudies,
  blog: Blog, pricing: Pricing, testimonials: Testimonials, team: Team, contact: Contact,
  highlights: Highlights, bento: Bento, platforms: Platforms, compare: Compare, locations: Locations, html: HtmlBlock, module: ModuleBlock,
};

export function Blocks({ blocks, status }: { blocks: Block[]; status?: string }) {
  const visible = (blocks || []).filter((b) => !b.hidden && MAP[b.type]);
  let n = 0;
  return <>{visible.map((b, i) => {
    const C = MAP[b.type]; const numbered = i > 0 && b.type !== "marquee" && b.type !== "cta" && b.type !== "highlights";
    return <C key={b.id || i} d={{ ...(b.data || {}), ...(numbered ? { _n: ++n } : {}), ...(i === 0 && b.type === "hero" ? { _status: status } : {}) }} first={i === 0} />;
  })}</>;
}
