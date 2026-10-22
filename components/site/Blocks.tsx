import Link from "next/link";
import type { Block } from "@/lib/blocks";
import { getPublished, related, type Entry } from "@/lib/content";
import { getAllSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { ogFallback } from "@/lib/seo";
import { fmtDate, formatPrice } from "@/lib/util";
import { Counter, Media, Reveal, Tilt } from "./motion";
import { BlogList, ContactForm, FaqList, PricingTabs, WorkGrid } from "./Interactive";

type D = Record<string, any>;
const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

function Head({ d, center = false, className = "" }: { d: D; center?: boolean; className?: string }) {
  if (!d.heading && !d.intro) return null;
  return (
    <Reveal className={`mb-12 ${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {d.heading && <h2 className="h-section">{d.heading}</h2>}
      {d.intro && <p className={`lead mt-4 ${center ? "mx-auto" : ""}`}>{d.intro}</p>}
    </Reveal>
  );
}
const Btn = ({ label, href, primary }: { label?: string; href?: string; primary?: boolean }) => (label && href ? <Link href={href} className={`btn ${primary ? "btn-primary" : "btn-ghost"}`}>{label}</Link> : null);

/* ---------------- individual blocks ---------------- */
function Hero({ d, first }: { d: D; first: boolean }) {
  const src = mediaUrl(d.media);
  const bg = d.mediaMode === "background" && src;
  const words = String(d.heading || "").split(/\s+/).filter(Boolean);
  const Tag = first ? "h1" : "h2";
  return (
    <section className={`tex relative overflow-hidden ${first ? "pb-20 pt-16 sm:pb-28 sm:pt-24" : "section"}`}>
      <div className="aurora" aria-hidden><span /><span /><span /></div>
      {bg && <div className="absolute inset-0 -z-10 opacity-40"><Media src={src} alt="" priority className="h-full w-full" /><div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" /></div>}
      <div className={`container-x grid items-center gap-12 ${src && !bg ? "lg:grid-cols-[1.15fr_.85fr]" : ""}`}>
        <div className={src && !bg ? "" : "max-w-4xl"}>
          {arr(d.badges).length > 0 && (
            <div className="fade-in mb-7 flex flex-wrap gap-2" style={{ animationDelay: "80ms" }}>
              {arr(d.badges).map((b: string) => <span key={b} className="chip">{b}</span>)}
            </div>
          )}
          <Tag className={first ? "h-display" : "h-section"} aria-label={d.heading}>
            {words.map((w, i) => <span key={i} className="word" aria-hidden><span style={{ animationDelay: `${120 + i * 55}ms` }}>{w}</span>{i < words.length - 1 ? "\u00a0" : ""}</span>)}
          </Tag>
          {d.subheading && <p className="lead fade-in mt-7" style={{ animationDelay: `${200 + words.length * 55}ms` }}>{d.subheading}</p>}
          {(d.primaryLabel || d.secondaryLabel) && (
            <div className="fade-in mt-10 flex flex-wrap gap-3" style={{ animationDelay: `${320 + words.length * 55}ms` }}>
              <Btn label={d.primaryLabel} href={d.primaryHref} primary /><Btn label={d.secondaryLabel} href={d.secondaryHref} />
            </div>
          )}
        </div>
        {src && !bg && (
          <div className="fade-in relative" style={{ animationDelay: "350ms" }}>
            <div aria-hidden className="float absolute -right-6 -top-6 h-24 w-24 rounded-full border border-accent/40" />
            <div aria-hidden className="float absolute -bottom-8 -left-8 h-16 w-16 border border-accent2/50" style={{ borderRadius: "var(--r-md)", animationDelay: "-3s" }} />
            <div className="glass overflow-hidden p-2"><Media src={src} alt={mediaAlt(d.media, d.heading)} priority className="aspect-[16/10] w-full" cover /></div>
          </div>
        )}
      </div>
    </section>
  );
}

function Split({ d }: { d: D }) {
  const src = mediaUrl(d.media);
  return (
    <section className="section">
      <div className={`container-x grid items-center gap-12 ${src ? "lg:grid-cols-2" : ""}`}>
        <Reveal className={d.reverse ? "lg:order-2" : ""}>
          {d.heading && <h2 className="h-section">{d.heading}</h2>}
          {d.body && <div className="prose-site mt-5 text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.body) }} />}
          {d.linkLabel && <div className="mt-8"><Btn label={d.linkLabel} href={d.linkHref} /></div>}
        </Reveal>
        {src && <Reveal delay={120} className={d.reverse ? "lg:order-1" : ""}><div className="glass overflow-hidden p-2"><Media src={src} alt={mediaAlt(d.media, d.heading)} className="aspect-[4/3] w-full" /></div></Reveal>}
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {arr(d.items).map((c, i) => {
        const inner = (<>
          {mediaUrl(c.image) && <div className="aspect-[4/3] overflow-hidden border-b border-line"><Media src={mediaUrl(c.image)} alt={mediaAlt(c.image, c.title)} className="h-full w-full" /></div>}
          <div className="p-6"><h3 className="text-xl font-semibold">{c.title}</h3>{c.text && <p className="mt-2 text-fg2">{c.text}</p>}</div>
        </>);
        return <Reveal key={i} delay={i * 70}><Tilt className="h-full">{c.href ? <Link href={c.href} className="block h-full">{inner}</Link> : inner}</Tilt></Reveal>;
      })}
    </div>
  </div></section>
);

const Features = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><Head d={d} className="!mb-0" />
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {arr(d.items).map((f, i) => <Reveal key={i} delay={i * 60} className="border-t border-line pt-5"><h3 className="text-lg font-semibold">{f.title}</h3><p className="mt-2 text-fg2">{f.text}</p></Reveal>)}
    </div>
  </div></section>
);

function Steps({ d }: { d: D }) {
  const src = mediaUrl(d.media);
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <div className={`grid gap-12 ${src ? "lg:grid-cols-2" : ""}`}>
        <ol className={`grid gap-5 ${src ? "" : "md:grid-cols-2 lg:grid-cols-4"}`}>
          {arr(d.items).map((s, i) => (
            <Reveal as="li" key={i} delay={i * 90} className="glass relative p-6">
              <span className="font-mono text-sm text-accent">Step {i + 1}</span>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>{s.text && <p className="mt-2 text-fg2">{s.text}</p>}
            </Reveal>
          ))}
        </ol>
        {src && <Reveal><div className="glass sticky top-24 overflow-hidden p-2"><Media src={src} alt={mediaAlt(d.media, d.heading)} className="aspect-[4/3] w-full" /></div></Reveal>}
      </div>
    </div></section>
  );
}

const Stats = ({ d }: { d: D }) => (
  <section className="section"><div className="container-x"><Head d={d} center />
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4" style={{ borderRadius: "var(--r-lg)" }}>
      {arr(d.items).map((s, i) => (
        <div key={i} className="bg-bg p-8 text-center">
          <p className="font-display text-4xl font-bold sm:text-5xl"><Counter value={Number(s.value) || 0} suffix={s.suffix || ""} /></p>
          <p className="mt-2 text-fg2">{s.label}</p>
        </div>
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
    <div className="tex relative overflow-hidden border border-line px-6 py-16 text-center sm:px-16" style={{ borderRadius: "var(--r-xl)", background: "radial-gradient(80% 120% at 50% 0%, rgb(var(--c-accent) / .22), transparent 70%), rgb(var(--c-surface))" }}>
      <h2 className="h-section mx-auto max-w-3xl">{d.heading}</h2>
      {d.text && <p className="lead mx-auto mt-4">{d.text}</p>}
      <div className="mt-9 flex flex-wrap justify-center gap-3"><Btn label={d.primaryLabel} href={d.primaryHref} primary /><Btn label={d.secondaryLabel} href={d.secondaryHref} /></div>
    </div>
  </Reveal></div></section>
);

function Marquee({ d }: { d: D }) {
  const items = arr(d.items); if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <section className="py-12">
      <div className="container-x">{d.heading && <p className="mb-6 text-center text-fg2">{d.heading}</p>}</div>
      <div className="marquee overflow-hidden" aria-label={d.heading || "Clients"}>
        <ul className="marquee-track items-center gap-14 px-7">
          {row.map((l, i) => (
            <li key={i} aria-hidden={i >= items.length} className="shrink-0">
              {mediaUrl(l.logo) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={mediaUrl(l.logo)} alt={mediaAlt(l.logo, l.label)} className="h-8 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" loading="lazy" />
                : <span className="font-display text-2xl font-bold text-muted">{l.label}</span>}
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
      <div className="grid gap-6 md:grid-cols-2">
        {list.map((s, i) => (
          <Reveal key={s.id} delay={i * 70}><Tilt className="h-full"><Link href={`/services/${s.slug}`} className="flex h-full flex-col p-7">
            <span aria-hidden className="grid h-12 w-12 place-items-center text-xl text-accent" style={{ borderRadius: "var(--r-md)", background: "rgb(var(--c-accent) / .12)" }}>{s.data.icon || "◆"}</span>
            <h3 className="mt-6 text-2xl font-semibold">{s.title}</h3>
            <p className="mt-3 text-fg2">{s.data.summary}</p>
            <span className="mt-auto pt-6 font-medium text-accent">Explore {s.title.toLowerCase()}</span>
          </Link></Tilt></Reveal>
        ))}
      </div>
    </div></section>
  );
}

export async function workCards(list: Entry[]) {
  const services = await getPublished("services");
  return list.map((p) => ({
    id: p.id, title: p.title, href: `/work/${p.slug}`, client: p.data.client || "",
    img: mediaUrl(p.data.screenshot) || mediaUrl(p.data.cover) || ogFallback(p.title, "page", "Work"),
    alt: mediaAlt(p.data.screenshot, `${p.title} website screenshot`), industry: p.data.industry || "",
    services: (Array.isArray(p.data.services) ? p.data.services : []).map((id: any) => services.find((s) => s.id === Number(id))?.title).filter(Boolean) as string[],
    status: p.data.workStatus || "completed", summary: p.data.summary || "",
  }));
}

async function Work({ d }: { d: D }) {
  let list = await getPublished("projects");
  if (d.featuredOnly) list = list.filter((p) => p.featured);
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return <section className="section"><div className="container-x"><Head d={d} /><WorkGrid items={await workCards(list)} filters={!!d.filters} /></div></section>;
}

async function CaseStudies({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.caseStudies) return null;
  let list = await getPublished("caseStudies");
  list = [...list.filter((c) => c.featured), ...list.filter((c) => !c.featured)];
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  const [first, ...rest] = list;
  const img = (c: Entry) => mediaUrl(c.data.cover) || ogFallback(c.title, "case", "Case Study");
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <Reveal><Link href={`/case-studies/${first.slug}`} className="card group grid overflow-hidden md:grid-cols-[1fr_1.1fr]">
        <div className="aspect-[4/5] overflow-hidden bg-raised md:aspect-auto"><Media src={img(first)} alt={mediaAlt(first.data.cover, first.title)} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
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
            <div className="aspect-[4/3] overflow-hidden bg-raised"><Media src={img(c)} alt={mediaAlt(c.data.cover, c.title)} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
            <div className="p-6"><p className="text-sm text-muted">{c.data.client}</p><h3 className="mt-1 text-xl font-semibold">{c.title}</h3></div>
          </Link></Reveal>
        ))}
      </div>}
    </div></section>
  );
}

export async function postCards(list: Entry[]) {
  const [cats, team] = await Promise.all([getPublished("categories"), getPublished("team")]);
  return list.map((p) => ({
    id: p.id, title: p.title, href: `/blog/${p.slug}`, img: mediaUrl(p.data.cover) || ogFallback(p.title, "post", p.data.kind === "update" ? "Update" : "Article"),
    alt: mediaAlt(p.data.cover, p.title), excerpt: p.data.excerpt || "", category: cats.find((c) => c.id === Number(p.data.category))?.title || "",
    date: fmtDate(p.publishedAt || p.createdAt), author: team.find((t) => t.id === Number(p.data.author))?.title || "", kind: p.data.kind || "article",
  }));
}

async function Blog({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.blog) return null;
  let list = await getPublished("posts");
  list = [...list].sort((a, b) => +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt));
  if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return <section className="section"><div className="container-x"><Head d={d} /><BlogList items={await postCards(list)} filters={!!d.filters} /></div></section>;
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
    <section className="section"><div className="container-x"><Head d={d} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((t, i) => (
          <Reveal key={t.id} delay={i * 70}><figure className="glass flex h-full flex-col p-7">
            <span aria-hidden className="font-display text-5xl leading-none text-accent">“</span>
            <blockquote className="mt-2 flex-1 text-lg text-fg">{t.data.quote}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              {mediaUrl(t.data.photo) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={mediaUrl(t.data.photo)} alt={mediaAlt(t.data.photo, t.title)} className="h-11 w-11 rounded-full object-cover" loading="lazy" />}
              <div><p className="font-semibold">{t.title}</p><p className="text-sm text-fg2">{[t.data.role, t.data.company].filter(Boolean).join(", ")}</p></div>
            </figcaption>
          </figure></Reveal>
        ))}
      </div>
    </div></section>
  );
}

async function Team({ d }: { d: D }) {
  const s = await getAllSettings(); if (!s.features.team) return null;
  let list = await getPublished("team"); if (Number(d.limit) > 0) list = list.slice(0, Number(d.limit));
  if (!list.length) return null;
  return (
    <section className="section"><div className="container-x"><Head d={d} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((m, i) => (
          <Reveal key={m.id} delay={i * 70}><Tilt className="h-full">
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
        ))}
      </div>
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
      <div className="glass p-6 sm:p-8"><ContactForm formId={form?.id ?? null} fields={fields} success={form?.data.successMessage || "Thanks! We'll be in touch soon."} /></div>
    </div></section>
  );
}

/* ---------------- renderer ---------------- */
const MAP: Record<string, (p: { d: D; first: boolean }) => any> = {
  hero: Hero, richtext: RichText, split: Split, cards: Cards, features: Features, steps: Steps, stats: Stats, timeline: Timeline,
  faq: Faq, cta: Cta, marquee: Marquee, gallery: Gallery, video: Video, services: Services, work: Work, casestudies: CaseStudies,
  blog: Blog, pricing: Pricing, testimonials: Testimonials, team: Team, contact: Contact,
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  const visible = (blocks || []).filter((b) => !b.hidden && MAP[b.type]);
  return <>{visible.map((b, i) => { const C = MAP[b.type]; return <C key={b.id || i} d={b.data || {}} first={i === 0} />; })}</>;
}
