"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCollection } from "@/lib/collections";
import { slugify } from "@/lib/util";
import { apiFetch, Empty, fmt, Modal, PageHead, Spinner, toast } from "./ui";
import { aiSeo, mergeSeo } from "./SeoPanel";
import { useAdmin } from "./context";
import { useRelation } from "./FieldInput";
import { PAGE_TEMPLATES } from "@/lib/templates";
import { newBlock } from "@/lib/blocks";

type Status = "all" | "published" | "draft" | "trash";

export function ListScreen({ collection, openAi }: { collection: string; openAi?: boolean }) {
  const col = getCollection(collection)!;
  const router = useRouter(); const { aiOn } = useAdmin();
  const [status, setStatus] = useState<Status>("all"); const [q, setQ] = useState(""); const [sort, setSort] = useState("order"); const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [items, setItems] = useState<any[]>([]); const [counts, setCounts] = useState<any>({}); const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<number[]>([]); const [quick, setQuick] = useState<any>(null);
  const [job, setJob] = useState<{ label: string; done: number; total: number; log: string[] } | null>(null); const stop = useRef(false);
  const [picker, setPicker] = useState(false);
  const [modal, setModal] = useState<"" | "page" | "location" | "case">(openAi ? (collection === "caseStudies" ? "case" : collection === "pages" ? "page" : "") : "");

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await apiFetch(`/api/admin/entries?collection=${collection}&status=${status}&q=${encodeURIComponent(q)}&sort=${sort}&dir=${dir}`); setItems(r.items); setCounts(r.counts); setSel([]); }
    catch (e: any) { toast(e.message, "error"); }
    setLoading(false);
  }, [collection, status, q, sort, dir]);
  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);

  async function bulk(action: string, ids = sel) {
    if (!ids.length) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} item(s) permanently? This can't be undone.`)) return;
    try { const r = await apiFetch("/api/admin/entries/bulk", { method: "POST", json: { ids, action } }); toast(`${r.count} item(s) updated.`); load(); } catch (e: any) { toast(e.message, "error"); }
  }
  async function emptyTrash() {
    if (!confirm("Permanently delete everything in the trash?")) return;
    try { const r = await apiFetch("/api/admin/trash", { method: "POST", json: { collection } }); toast(`Deleted ${r.count} item(s).`); load(); } catch (e: any) { toast(e.message, "error"); }
  }
  async function saveQuick() {
    try { await apiFetch(`/api/admin/entries/${quick.id}`, { method: "PUT", json: { title: quick.title, slug: quick.slug, status: quick.status, sortOrder: quick.sortOrder } }); toast("Saved."); setQuick(null); load(); } catch (e: any) { toast(e.message, "error"); }
  }

  async function runJob(label: string, list: any[], fn: (it: any) => Promise<string>) {
    stop.current = false; setJob({ label, done: 0, total: list.length, log: [] });
    for (let i = 0; i < list.length; i++) {
      if (stop.current) { setJob((j) => j && { ...j, log: [...j.log, "Stopped."] }); break; }
      let msg: string; try { msg = await fn(list[i]); } catch (e: any) { msg = `✕ ${list[i].title || list[i]}: ${e.message}`; }
      setJob((j) => j && { ...j, done: i + 1, log: [...j.log, msg] });
    }
    load();
  }
  const bulkSeo = () => {
    const targets = (sel.length ? items.filter((i) => sel.includes(i.id)) : items.filter((i) => !i.seo?.metaTitle || !i.seo?.metaDescription));
    if (!targets.length) return toast("Every item already has a meta title and description.", "info");
    runJob("Writing SEO", targets, async (it) => {
      const gen = await aiSeo(collection, { title: it.title, slug: it.slug, ...it.data });
      await apiFetch(`/api/admin/entries/${it.id}`, { method: "PUT", json: { seo: mergeSeo(it.seo || {}, gen, true) } });
      return `✓ ${it.title}`;
    });
  };
  const servicePages = () => {
    const targets = sel.length ? items.filter((i) => sel.includes(i.id)) : items.filter((i) => i.status === "published");
    runJob("Creating service pages", targets, async (it) => {
      const r = await apiFetch("/api/admin/ai/generate", { method: "POST", json: { kind: "servicePage", serviceId: it.id } });
      return r.status === "created" ? `✓ Draft page created at /${r.slug}` : `– ${it.title}: ${r.reason}`;
    });
  };

  const tabs: [Status, string][] = [["all", "All"], ["published", "Published"], ["draft", "Draft"], ["trash", "Trash"]];
  const sortBy = (k: string) => { if (sort === k) setDir(dir === "asc" ? "desc" : "asc"); else { setSort(k); setDir(k === "updated" ? "desc" : "asc"); } };
  const Th = ({ k, children }: { k: string; children: string }) => <th className="px-3 py-2.5 text-left font-medium"><button onClick={() => sortBy(k)} className="hover:text-fg">{children}{sort === k ? (dir === "asc" ? " ↑" : " ↓") : ""}</button></th>;

  return (
    <>
      <PageHead title={col.label}>
        {collection === "pages" && <><button className="btn btn-ghost !py-2 text-sm" disabled={!aiOn} onClick={() => setModal("location")}>✦ Location & industry pages</button><button className="btn btn-ghost !py-2 text-sm" disabled={!aiOn} onClick={() => setModal("page")}>✦ Write a page with AI</button></>}
        {collection === "caseStudies" && <button className="btn btn-ghost !py-2 text-sm" disabled={!aiOn} onClick={() => setModal("case")}>✦ Write a case study with AI</button>}
        {collection === "services" && <button className="btn btn-ghost !py-2 text-sm" disabled={!aiOn || !!job} onClick={servicePages}>✦ Create pages from {sel.length ? "selected" : "all"} services</button>}
        {col.seo && <button className="btn btn-ghost !py-2 text-sm" disabled={!aiOn || !!job} onClick={bulkSeo}>✦ Write SEO for {sel.length ? "selected" : "items missing it"}</button>}
        {collection === "pages" ? <button className="btn btn-primary !py-2 text-sm" onClick={() => setPicker(true)}>Add page from template</button> : <Link href={`/admin/c/${collection}/new`} className="btn btn-primary !py-2 text-sm">Add {col.singular.toLowerCase()}</Link>}
      </PageHead>
      {!aiOn && (col.seo || collection === "services") && <p className="-mt-3 mb-4 text-xs text-muted">AI buttons are disabled until you add a key in Admin &gt; AI.</p>}

      {job && (
        <div className="glass mb-5 p-4">
          <div className="flex items-center justify-between gap-3"><p className="font-medium">{job.label}: {job.done} of {job.total}</p>
            {job.done < job.total ? <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => (stop.current = true)}>Stop</button> : <button className="text-sm text-fg2" onClick={() => setJob(null)}>Close</button>}</div>
          <div className="mt-3 h-1.5 overflow-hidden rounded bg-raised"><div className="h-full bg-accent transition-all" style={{ width: `${(job.done / Math.max(1, job.total)) * 100}%` }} /></div>
          <ul className="mt-3 max-h-40 overflow-y-auto text-sm text-fg2">{job.log.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">{tabs.map(([k, l]) => <button key={k} onClick={() => setStatus(k)} className={`rounded px-3 py-1.5 text-sm ${status === k ? "bg-raised text-fg" : "text-fg2 hover:text-fg"}`}>{l} <span className="text-muted">{counts[k] ?? 0}</span></button>)}</div>
        <input className="input sm:max-w-xs" placeholder={`Search ${col.label.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      </div>

      {sel.length > 0 && (
        <div className="glass mb-3 flex flex-wrap items-center gap-2 p-2.5 text-sm">
          <span className="px-2 text-fg2">{sel.length} selected</span>
          {status === "trash" ? <><button className="btn btn-ghost !py-1.5" onClick={() => bulk("restore")}>Restore</button><button className="btn btn-ghost !py-1.5 text-danger" onClick={() => bulk("delete")}>Delete permanently</button></>
            : <><button className="btn btn-ghost !py-1.5" onClick={() => bulk("publish")}>Publish</button><button className="btn btn-ghost !py-1.5" onClick={() => bulk("draft")}>Set to draft</button><button className="btn btn-ghost !py-1.5" onClick={() => bulk("duplicate")}>Duplicate</button><button className="btn btn-ghost !py-1.5" onClick={() => bulk("feature")}>Feature</button><button className="btn btn-ghost !py-1.5 text-danger" onClick={() => bulk("trash")}>Move to trash</button></>}
        </div>
      )}
      {status === "trash" && items.length > 0 && <div className="mb-3 flex justify-between text-sm text-fg2"><span>Items in the trash are deleted automatically after the retention period set in Settings.</span><button className="text-danger hover:underline" onClick={emptyTrash}>Empty trash</button></div>}

      {loading ? <p className="flex items-center gap-2 text-fg2"><Spinner /> Loading…</p> : items.length === 0 ? (
        <Empty title={status === "trash" ? "The trash is empty." : q ? `Nothing matches “${q}”.` : `No ${col.label.toLowerCase()} yet.`}>{status !== "trash" && !q && <Link href={`/admin/c/${collection}/new`} className="text-accent underline">Add the first one</Link>}</Empty>
      ) : (
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-fg2"><tr>
              <th className="w-10 px-3"><input type="checkbox" aria-label="Select all" checked={sel.length === items.length} onChange={(e) => setSel(e.target.checked ? items.map((i) => i.id) : [])} /></th>
              <Th k="title">{col.titleLabel}</Th><Th k="status">Status</Th><Th k="order">Order</Th><Th k="updated">Updated</Th><th />
            </tr></thead>
            <tbody className="divide-y divide-line">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-raised/40">
                  <td className="px-3"><input type="checkbox" aria-label={`Select ${it.title}`} checked={sel.includes(it.id)} onChange={(e) => setSel(e.target.checked ? [...sel, it.id] : sel.filter((x) => x !== it.id))} /></td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/c/${collection}/${it.id}`} className="font-medium text-fg hover:text-accent">{it.title || "(untitled)"}</Link>
                    <div className="flex flex-wrap gap-2 text-xs text-muted">{it.slug && <span className="font-mono">/{it.slug}</span>}{it.data?.template && <span className="text-accent">Template</span>}{it.data?.location && <span>Location page</span>}{it.builtin && <span>Built-in</span>}{it.featured && <span className="text-accent">Featured</span>}{col.seo && !it.seo?.metaDescription && <span className="text-warning">No meta description</span>}</div>
                  </td>
                  <td className="px-3"><span className={`chip !py-0.5 ${it.status === "published" ? "!text-success" : ""}`}>{it.deletedAt ? "Trashed" : it.status === "published" ? "Published" : "Draft"}</span></td>
                  <td className="px-3 text-fg2">{it.sortOrder}</td>
                  <td className="whitespace-nowrap px-3 text-fg2">{fmt(it.updatedAt)}</td>
                  <td className="whitespace-nowrap px-3 text-right">{!it.deletedAt && <button className="text-fg2 hover:text-accent" onClick={() => setQuick({ ...it })}>Quick edit</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!quick} onClose={() => setQuick(null)} title="Quick edit">
        {quick && <div className="space-y-4">
          <div><label className="label">{col.titleLabel}</label><input className="input" value={quick.title} onChange={(e) => setQuick({ ...quick, title: e.target.value })} /></div>
          {col.hasSlug && <div><label className="label">Slug</label><input className="input font-mono" disabled={quick.builtin} value={quick.slug} onChange={(e) => setQuick({ ...quick, slug: e.target.value })} /></div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Status</label><select className="input" value={quick.status} onChange={(e) => setQuick({ ...quick, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option></select></div>
            <div><label className="label">Order</label><input type="number" className="input" value={quick.sortOrder} onChange={(e) => setQuick({ ...quick, sortOrder: Number(e.target.value) })} /></div>
          </div>
          <button className="btn btn-primary" onClick={saveQuick}>Save changes</button>
        </div>}
      </Modal>
      {picker && <TemplatePicker onClose={() => setPicker(false)} onDone={(id) => router.push(`/admin/c/pages/${id}`)} />}
      {modal === "page" && <PageWriter onClose={() => setModal("")} onDone={(id) => router.push(`/admin/c/pages/${id}`)} />}
      {modal === "location" && <LocationWriter onClose={() => { setModal(""); load(); }} />}
      {modal === "case" && <CaseWriter onClose={() => setModal("")} onDone={(id) => router.push(`/admin/c/caseStudies/${id}`)} />}
    </>
  );
}

/* ---------------- Whole-page writer ---------------- */
function PageWriter({ onClose, onDone }: { onClose: () => void; onDone: (id: number) => void }) {
  const pages = useRelation("pages");
  const [f, setF] = useState({ target: "new", pageType: "service", topic: "", audience: "", keyword: "", facts: "" }); const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF({ ...f, [k]: v });
  async function go() {
    if (!f.topic.trim()) return toast("Describe the topic first.", "error");
    setBusy(true);
    try {
      if (f.target === "new") {
        const r = await apiFetch("/api/admin/ai/generate", { method: "POST", json: { kind: "page", ...f } });
        toast("Draft page created. Review it, then publish."); onDone(r.id);
      } else {
        const { item } = await apiFetch(`/api/admin/entries/${f.target}`);
        const blocks = item.data.blocks || [];
        const r = await apiFetch("/api/admin/ai", { method: "POST", json: { task: "page", ...f, builtinTypes: blocks.map((b: any) => b.type) } });
        const out = [...r.data.blocks];
        const merged = blocks.map((b: any) => { const i = out.findIndex((x: any) => x.type === b.type); if (i < 0) return b; const [x] = out.splice(i, 1); return { ...b, data: { ...b.data, ...Object.fromEntries(Object.entries(x.data).filter(([, v]) => v !== "" && v != null)) } }; });
        await apiFetch(`/api/admin/entries/${item.id}`, { method: "PUT", json: { data: { ...item.data, blocks: merged }, seo: { ...item.seo, ...r.data.seo } } });
        toast("Built-in page rewritten. Review and save."); onDone(item.id);
      }
    } catch (e: any) { toast(e.message, "error"); }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title="Write a page with AI">
      <div className="space-y-4">
        <div><label className="label">Page</label><select className="input" value={f.target} onChange={(e) => set("target", e.target.value)}><option value="new">A new page</option>{pages.map((p) => <option key={p.id} value={p.id}>Rewrite: {p.title}</option>)}</select></div>
        {f.target === "new" && <div><label className="label">Page type</label><select className="input" value={f.pageType} onChange={(e) => set("pageType", e.target.value)}>{["service", "landing", "about", "location", "industry", "legal", "other"].map((t) => <option key={t}>{t}</option>)}</select></div>}
        <div><label className="label">Topic</label><textarea className="input" rows={2} value={f.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Website redesigns for dental clinics" /></div>
        <div><label className="label">Audience</label><input className="input" value={f.audience} onChange={(e) => set("audience", e.target.value)} /></div>
        <div><label className="label">Target keyword (optional)</label><input className="input" value={f.keyword} onChange={(e) => set("keyword", e.target.value)} /></div>
        <div><label className="label">Real facts to include (optional)</label><textarea className="input" rows={3} value={f.facts} onChange={(e) => set("facts", e.target.value)} placeholder="Only things that are true. The AI won't invent numbers or clients." /></div>
        <button className="btn btn-primary" disabled={busy} onClick={go}>{busy ? <><Spinner /> Writing… this takes up to a minute</> : f.target === "new" ? "Write draft page" : "Rewrite page text"}</button>
      </div>
    </Modal>
  );
}

/* ---------------- Location / industry pages ---------------- */
function LocationWriter({ onClose }: { onClose: () => void }) {
  const services = useRelation("services");
  const [f, setF] = useState({ type: "location", names: "", serviceId: "", facts: "" }); const [log, setLog] = useState<string[]>([]); const [busy, setBusy] = useState(false); const stop = useRef(false);
  async function go() {
    const names = f.names.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (!names.length || !f.serviceId) return toast("Add at least one name and pick a service.", "error");
    setBusy(true); stop.current = false; setLog([]);
    for (const name of names) {
      if (stop.current) { setLog((l) => [...l, "Stopped."]); break; }
      try { const r = await apiFetch("/api/admin/ai/generate", { method: "POST", json: { kind: "locationPage", type: f.type, name, serviceId: Number(f.serviceId), facts: f.facts, others: names.filter((n) => n !== name) } }); setLog((l) => [...l, r.status === "created" ? `✓ ${name}: draft at /${r.slug}` : `– ${name}: ${r.reason}`]); }
      catch (e: any) { setLog((l) => [...l, `✕ ${name}: ${e.message}`]); }
    }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title="Location & industry pages">
      <div className="space-y-4">
        <div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" checked={f.type === "location"} onChange={() => setF({ ...f, type: "location" })} />Places</label><label className="flex items-center gap-2"><input type="radio" checked={f.type === "industry"} onChange={() => setF({ ...f, type: "industry" })} />Industries</label></div>
        <div><label className="label">{f.type === "location" ? "Places" : "Industries"} (comma or line separated)</label><textarea className="input" rows={3} value={f.names} onChange={(e) => setF({ ...f, names: e.target.value })} placeholder={f.type === "location" ? "Toronto, Vancouver, Calgary" : "law firms, dentists, real estate agents"} /></div>
        <div><label className="label">Service (used for pricing)</label><select className="input" value={f.serviceId} onChange={(e) => setF({ ...f, serviceId: e.target.value })}><option value="">Choose…</option>{services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
        <div><label className="label">Real local or industry facts (optional)</label><textarea className="input" rows={2} value={f.facts} onChange={(e) => setF({ ...f, facts: e.target.value })} /></div>
        <p className="text-xs text-muted">Location pages never claim a local office or team unless you add it as a fact. Each page is written separately so they don&apos;t read as duplicates. Existing pages are never overwritten.</p>
        <div className="flex gap-2"><button className="btn btn-primary" disabled={busy} onClick={go}>{busy ? <><Spinner /> Writing…</> : "Create draft pages"}</button>{busy && <button className="btn btn-ghost" onClick={() => (stop.current = true)}>Stop</button>}</div>
        {log.length > 0 && <ul className="max-h-40 overflow-y-auto text-sm text-fg2">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
      </div>
    </Modal>
  );
}

/* ---------------- Case study writer ---------------- */
function CaseWriter({ onClose, onDone }: { onClose: () => void; onDone: (id: number) => void }) {
  const services = useRelation("services");
  const [f, setF] = useState({ client: "", website: "", services: [] as number[], problem: "", results: "" }); const [busy, setBusy] = useState(false);
  async function go() {
    if (!f.client || !f.problem) return toast("Add the client and the problem.", "error");
    setBusy(true);
    try {
      const names = services.filter((s) => f.services.includes(s.id)).map((s) => s.title).join(", ");
      const r = await apiFetch("/api/admin/ai", { method: "POST", json: { task: "caseStudy", client: f.client, website: f.website, services: names, problem: f.problem, results: f.results } });
      const { seo, title, ...data } = r.data;
      const c = await apiFetch("/api/admin/entries", { method: "POST", json: { collection: "caseStudies", title: title || f.client, slug: slugify(title || f.client), status: "draft", data: { ...data, client: f.client, services: f.services }, seo } });
      toast("Draft case study created."); onDone(c.item.id);
    } catch (e: any) { toast(e.message, "error"); }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title="Write a case study with AI">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2"><div><label className="label">Client</label><input className="input" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} /></div><div><label className="label">Client website</label><input className="input" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} placeholder="https://" /></div></div>
        <div><label className="label">Services we performed</label><div className="flex flex-wrap gap-3">{services.map((s) => <label key={s.id} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={f.services.includes(s.id)} onChange={(e) => setF({ ...f, services: e.target.checked ? [...f.services, s.id] : f.services.filter((x) => x !== s.id) })} />{s.title}</label>)}</div></div>
        <div><label className="label">The problem, in the owner&apos;s words</label><textarea className="input" rows={3} value={f.problem} onChange={(e) => setF({ ...f, problem: e.target.value })} /></div>
        <div><label className="label">Real results (the only numbers the AI may use)</label><textarea className="input" rows={3} value={f.results} onChange={(e) => setF({ ...f, results: e.target.value })} placeholder="e.g. Online bookings went from 0 to 140 a month" /></div>
        <button className="btn btn-primary" disabled={busy} onClick={go}>{busy ? <><Spinner /> Writing…</> : "Write draft case study"}</button>
      </div>
    </Modal>
  );
}

/* ---------------- New page from a template ---------------- */
function TemplatePicker({ onClose, onDone }: { onClose: () => void; onDone: (id: number) => void }) {
  const [sel, setSel] = useState("service"); const [title, setTitle] = useState(""); const [busy, setBusy] = useState(false);
  const t = PAGE_TEMPLATES.find((x) => x.id === sel)!;
  async function go() {
    setBusy(true);
    try {
      const name = title.trim() || t.label.replace(/ \(.*\)/, "");
      const r = await apiFetch("/api/admin/entries", { method: "POST", json: { collection: "pages", title: name, slug: slugify(name), status: "draft", data: { blocks: t.blocks.map(([type, data]) => newBlock(type, structuredClone(data))), ...(t.template ? { template: true } : {}) }, seo: { schemaType: t.schema, ...(t.template ? { noindex: true } : {}) } } });
      toast("Draft page created."); onDone(r.item.id);
    } catch (e: any) { toast(e.message, "error"); }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title="New page" wide>
      <div className="mb-5"><label className="label" htmlFor="np-title">Page name</label><input id="np-title" className="input max-w-lg" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.label.replace(/ \(.*\)/, "")} /></div>
      <p className="label">Start from</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{PAGE_TEMPLATES.map((x) => (
        <button key={x.id} type="button" onClick={() => setSel(x.id)} aria-pressed={sel === x.id} className={`rounded border p-4 text-left transition-colors ${sel === x.id ? "border-accent bg-accent/10" : "border-line hover:border-fg/30"}`}>
          <p className="font-medium">{x.label}</p><p className="mt-1 text-sm text-fg2">{x.description}</p><p className="mono-tag mt-2 text-muted">{x.blocks.length} sections</p></button>
      ))}</div>
      <button className="btn btn-primary mt-6" disabled={busy} onClick={go}>{busy ? <Spinner /> : "Create draft page"}</button>
    </Modal>
  );
}
