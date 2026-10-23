"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Media } from "./motion";
import { ClipReveal } from "./fx";
import { CardLayout } from "./CardLayout";

/* ---------------- Work grid with filters ---------------- */
export interface WorkCard { id: number; title: string; href: string; img: string; alt: string; industry: string; services: string[]; status: string; summary: string; accent?: string; client?: string }
const STATUS: Record<string, string> = { completed: "Live", ongoing: "Still building", care: "Ongoing care" };


function workCard(p: WorkCard) {
  return (
    <Link href={p.href} data-cursor="View" className="group img-zoom block h-full">
      <ClipReveal className="relative bg-raised">
        <div className="relative aspect-[16/11]">
          <Media src={p.img} alt={p.alt} poster={p.title} className="h-full w-full" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-bg/80 px-3 py-1 text-xs font-medium text-fg backdrop-blur">
            <span className={`h-1.5 w-1.5 rounded-full ${p.status === "completed" ? "bg-success" : "animate-pulse bg-accent"}`} />{STATUS[p.status] || "Live"}
          </span>
        </div>
      </ClipReveal>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="h-card">{p.title}</h3>
          <p className="mt-1.5 text-fg2">{[p.client, p.industry].filter(Boolean).join(", ")}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">{p.services.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </div>
        <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line transition-all duration-500 group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-onaccent">→</span>
      </div>
    </Link>
  );
}

export function WorkGrid({ items, filters, layout = "grid", auto = true }: { items: WorkCard[]; filters?: boolean; layout?: string; auto?: boolean }) {
  const [industry, setIndustry] = useState(""); const [service, setService] = useState(""); const [status, setStatus] = useState("");
  const inds = useMemo(() => Array.from(new Set(items.map((i) => i.industry).filter(Boolean))), [items]);
  const svcs = useMemo(() => Array.from(new Set(items.flatMap((i) => i.services))), [items]);
  const list = items.filter((i) => (!industry || i.industry === industry) && (!service || i.services.includes(service)) && (!status || i.status === status));
  return (
    <div>
      {filters && (
        <div className="mb-8 flex flex-wrap gap-3" role="group" aria-label="Filter work">
          <Select label="Industry" value={industry} onChange={setIndustry} options={inds} />
          <Select label="Service" value={service} onChange={setService} options={svcs} />
          <Select label="Status" value={status} onChange={setStatus} options={Object.keys(STATUS)} labels={STATUS} />
          {(industry || service || status) && <button className="btn btn-ghost !py-2" onClick={() => { setIndustry(""); setService(""); setStatus(""); }}>Clear filters</button>}
        </div>
      )}
      {list.length === 0 && <p className="text-fg2">No projects match these filters.</p>}
      {layout === "carousel" ? <CardLayout layout="carousel" auto={auto} perView={3} items={list.map((p) => workCard(p))} />
        : <div className="grid gap-x-6 gap-y-16 md:grid-cols-12">
          {list.map((p, i) => { const wide = i % 4 === 0 || i % 4 === 3; return <div key={p.id} className={wide ? "md:col-span-7" : "md:col-span-5"}>{workCard(p)}</div>; })}
        </div>}
    </div>
  );
}

function Select({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  if (!options.length) return null;
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input !w-auto !rounded-full !py-2 pr-8">
        <option value="">All {label.toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{labels?.[o] || o}</option>)}
      </select>
    </label>
  );
}

/* ---------------- Blog list with category filter + search ---------------- */
export interface PostCard { id: number; title: string; href: string; img: string; alt: string; excerpt: string; category: string; date: string; author: string; kind: string }
export function BlogList({ items, filters, layout = "grid", auto = true }: { items: PostCard[]; filters?: boolean; layout?: string; auto?: boolean }) {
  const [cat, setCat] = useState(""); const [q, setQ] = useState("");
  const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  const list = items.filter((p) => (!cat || p.category === cat) && (!q || (p.title + " " + p.excerpt).toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      {filters && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
            {["", ...cats].map((c) => <button key={c || "all"} onClick={() => setCat(c)} aria-pressed={cat === c} className={`chip !px-4 !py-1.5 transition-colors ${cat === c ? "!border-accent !text-fg" : "hover:!text-fg"}`}>{c || "All"}</button>)}
          </div>
          <label className="sm:w-72"><span className="sr-only">Search posts</span><input className="input !rounded-full" placeholder="Search posts" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>
      )}
      {list.length === 0 && <p className="text-fg2">No posts found.</p>}
      <CardLayout layout={layout} auto={auto} perView={3} gridClass="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" items={list.map((p) => (
          <Link key={p.id} href={p.href} className="card group flex h-full flex-col transition-colors hover:border-accent/50">
            <div className="aspect-[16/9] overflow-hidden bg-raised"><Media src={p.img} alt={p.alt} poster={p.title} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-sm text-muted">{[p.category, p.date].filter(Boolean).join(", ")}</p>
              <h3 className="mt-1.5 text-lg font-semibold leading-snug">{p.title}</h3>
              {p.excerpt && <p className="mt-2 line-clamp-3 text-[0.95rem] text-fg2">{p.excerpt}</p>}
              {p.author && <p className="mt-auto pt-4 text-sm text-fg2">By {p.author}</p>}
            </div>
          </Link>
      ))} />
    </div>
  );
}

/* ---------------- FAQ: searchable, grouped accordion ---------------- */
export function FaqList({ items, searchable }: { items: { q: string; a: string; group: string }[]; searchable?: boolean }) {
  const [q, setQ] = useState("");
  const list = items.filter((i) => !q || (i.q + " " + i.a).toLowerCase().includes(q.toLowerCase()));
  const groups = searchable ? Array.from(new Set(list.map((i) => i.group || "General"))) : [""];
  return (
    <div>
      {searchable && <label className="mb-10 block max-w-xl"><span className="sr-only">Search questions</span><input className="input !py-3.5 text-lg" placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} /></label>}
      {list.length === 0 && <p className="text-fg2">No questions match “{q}”.</p>}
      <div className="space-y-12">
        {groups.map((g) => (
          <div key={g}>
            {g && <h2 className="mb-5 text-2xl font-bold sm:text-3xl">{g}</h2>}
            <div className="space-y-3">
              {list.filter((i) => !searchable || (i.group || "General") === g).map((i, n) => (
                <details key={n} className="glass group overflow-hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {i.q}
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div className="prose-site px-5 pb-5 !max-w-none" dangerouslySetInnerHTML={{ __html: i.a }} />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Pricing tabs ---------------- */
export interface PkgCard { id: number; name: string; price: string; range?: string; billing: string; delivery: string; summary: string; features: string[]; highlight: boolean }
export function PricingTabs({ groups, note, ctaHref }: { groups: { service: string; href: string; packages: PkgCard[] }[]; note?: string; ctaHref: string }) {
  const [tab, setTab] = useState(0);
  const g = groups[tab];
  if (!g) return <p className="text-fg2">Packages are coming soon. <Link className="text-accent underline" href={ctaHref}>Ask for a quote</Link>.</p>;
  return (
    <div>
      {groups.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2" role="tablist">
          {groups.map((x, i) => <button key={x.service} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={`btn !py-2 ${tab === i ? "btn-primary" : "btn-ghost"}`}>{x.service}</button>)}
        </div>
      )}
      <div role="tabpanel" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {g.packages.map((p) => (
          <div key={p.id} className={`card flex flex-col p-7 ${p.highlight ? "!border-accent/70" : ""}`}>
            {p.highlight && <span className="chip mb-4 self-start !border-accent/50 !text-fg">Recommended</span>}
            <h3 className="text-xl font-semibold">{p.name}</h3>
            {p.summary && <p className="mt-2 text-[0.95rem] text-fg2">{p.summary}</p>}
            <p className="mt-6 font-display text-4xl font-bold">{p.price || "Custom"}{p.range && <span className="text-2xl text-fg2"> to {p.range}</span>}</p>
            <p className="mt-1 text-sm text-muted">{p.billing}{p.delivery ? `, ${p.delivery}` : ""}</p>
            <ul className="mt-6 space-y-2.5 text-[0.95rem]">
              {p.features.map((f) => <li key={f} className="flex gap-2.5 text-fg2"><span aria-hidden className="mt-0.5 text-accent">✓</span>{f}</li>)}
            </ul>
            <Link href={ctaHref} className={`btn mt-auto !mt-8 ${p.highlight ? "btn-primary" : "btn-ghost"}`}>Get started</Link>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-fg2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm">{note}</p>
        <Link href={ctaHref} className="btn btn-ghost shrink-0">Need a custom quote? Book a call</Link>
      </div>
    </div>
  );
}

/* ---------------- Contact form ---------------- */
export interface FormField { name: string; label: string; type: string; options?: string; required?: boolean }
export function ContactForm({ formId, fields, success }: { formId: number | null; fields: FormField[]; success: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState("sending"); setErr("");
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch("/api/forms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ formId, values }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Couldn't send.");
      setState("done");
    } catch (x: any) { setErr(x.message); setState("error"); }
  }
  if (state === "done") return (
    <div className="glass fade-in p-8 text-center" role="status">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-2xl text-success">✓</div>
      <p className="text-lg text-fg">{success}</p>
    </div>
  );
  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {fields.map((f) => {
        const id = `f-${f.name}`; const wide = f.type === "textarea";
        return (
          <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
            <label htmlFor={id} className="label">{f.label}{f.required && <span className="text-accent"> *</span>}</label>
            {f.type === "textarea" ? <textarea id={id} name={f.name} required={f.required} rows={5} maxLength={5000} className="input" />
              : f.type === "select" ? (
                <select id={id} name={f.name} required={f.required} className="input" defaultValue="">
                  <option value="" disabled>Choose one</option>
                  {(f.options || "").split(",").map((o) => o.trim()).filter(Boolean).map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : <input id={id} name={f.name} type={["email", "tel", "number"].includes(f.type) ? f.type : "text"} required={f.required} maxLength={300} className="input" autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.name === "name" ? "name" : undefined} />}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button className="btn btn-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
        {state === "error" && <p className="text-sm text-danger" role="alert">{err}</p>}
      </div>
    </form>
  );
}

/* ---------------- Location / industry link grid with filters ---------------- */
export function LocationsGrid({ items, filters }: { items: { title: string; href: string; service: string; industry: string; city: string }[]; filters?: boolean }) {
  const [q, setQ] = useState(""); const [service, setService] = useState(""); const [industry, setIndustry] = useState("");
  const svcs = Array.from(new Set(items.map((i) => i.service).filter(Boolean))); const inds = Array.from(new Set(items.map((i) => i.industry).filter(Boolean)));
  const list = items.filter((i) => (!service || i.service === service) && (!industry || i.industry === industry) && (!q || (i.title + " " + i.city).toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      {filters && (
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <label className="sm:w-80"><span className="sr-only">Search locations</span><input className="input !rounded-full" placeholder="Search a city or industry" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <Select label="Service" value={service} onChange={setService} options={svcs} />
          <Select label="Industry" value={industry} onChange={setIndustry} options={inds} />
        </div>
      )}
      {list.length === 0 && <p className="text-fg2">No pages match.</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((l) => (
          <li key={l.href}><Link href={l.href} className="group flex h-full items-center justify-between gap-4 rounded-[var(--r-lg)] border border-line bg-surface/50 p-5 transition-all hover:border-accent hover:bg-raised">
            <span><span className="block font-medium text-fg">{l.title}</span><span className="mono-tag mt-1 block text-muted">{[l.service, l.city].filter(Boolean).join(" · ")}</span></span>
            <span aria-hidden className="text-accent transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link></li>
        ))}
      </ul>
    </div>
  );
}
