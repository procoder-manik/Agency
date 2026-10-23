"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, Empty, PageHead, Spinner, toast } from "./ui";
import { useRelation } from "./FieldInput";
import { DEFAULT_PATTERNS } from "@/lib/templating";

export function LocationsAdmin() {
  const services = useRelation("services");
  const [data, setData] = useState<{ templates: { id: number; title: string; usesIndustry: boolean }[]; pages: any[] } | null>(null);
  const [f, setF] = useState({ templateId: "", service: "", industries: "", locations: "", titlePattern: "", metaTitlePattern: "", metaDescriptionPattern: "", status: "draft" });
  const [preview, setPreview] = useState<any>(null); const [busy, setBusy] = useState(""); const [sel, setSel] = useState<number[]>([]);
  const load = () => apiFetch("/api/admin/locations").then((r) => { setData(r); setF((x) => ({ ...x, templateId: x.templateId || String(r.templates[0]?.id || "") })); }).catch((e) => toast(e.message, "error"));
  useEffect(() => { load(); }, []);
  const tpl = data?.templates.find((t) => String(t.id) === f.templateId);
  const defaults = tpl?.usesIndustry ? DEFAULT_PATTERNS.withIndustry : DEFAULT_PATTERNS.withoutIndustry;
  const set = (k: string, v: string) => { setF({ ...f, [k]: v }); setPreview(null); };

  async function run(dry: boolean) {
    setBusy(dry ? "preview" : "go");
    try {
      const r = await apiFetch("/api/admin/locations", { method: "POST", json: { ...f, dryRun: dry } });
      if (dry) setPreview(r); else { toast(`${r.created} page(s) created${r.skipped ? `, ${r.skipped} skipped because they already exist` : ""}. Review them below, then publish.`); setPreview(null); load(); }
    } catch (e: any) { toast(e.message, "error"); }
    setBusy("");
  }
  async function bulk(action: string) {
    if (!sel.length) return;
    try { const r = await apiFetch("/api/admin/entries/bulk", { method: "POST", json: { ids: sel, action } }); toast(`${r.count} page(s) updated.`); setSel([]); load(); } catch (e: any) { toast(e.message, "error"); }
  }
  const field = "input";
  return (
    <>
      <PageHead title="Location and industry pages" sub="Create landing pages such as “Website design for plumbers in Houston” from a template you design yourself." />
      {!data ? <p className="flex items-center gap-2 text-fg2"><Spinner /> Loading…</p> : (
        <>
          <div className="glass grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="label" htmlFor="tpl">1. Template page</label>
                <select id="tpl" className={field} value={f.templateId} onChange={(e) => set("templateId", e.target.value)}>{data.templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
                {tpl && <p className="mt-1.5 text-xs text-muted">Design this template in the page builder, then generate. <Link className="text-accent underline" href={`/admin/c/pages/${tpl.id}`}>Edit template design</Link></p>}
                {!data.templates.length && <p className="mt-1.5 text-xs text-warning">No template pages yet. Run Settings &gt; Starter content, or create a page and turn it into a template in Advanced.</p>}
              </div>
              <div>
                <label className="label" htmlFor="svc">2. Service</label>
                <input id="svc" list="svc-list" className={field} value={f.service} onChange={(e) => set("service", e.target.value)} placeholder="Website design" />
                <datalist id="svc-list">{services.map((s) => <option key={s.id} value={s.title.replace(" (draft)", "")} />)}</datalist>
              </div>
              {tpl?.usesIndustry && (
                <div>
                  <label className="label" htmlFor="ind">3. Industries (one per line)</label>
                  <textarea id="ind" className={field} rows={5} value={f.industries} onChange={(e) => set("industries", e.target.value)} placeholder={"plumber\ndental clinic | dental clinics\nelectrician"} />
                  <p className="mt-1 text-xs text-muted">Optional plural after a bar. Without it, we add an “s” or “ies” automatically.</p>
                </div>
              )}
              <div>
                <label className="label" htmlFor="loc">{tpl?.usesIndustry ? "4" : "3"}. Locations (one per line)</label>
                <textarea id="loc" className={field} rows={5} value={f.locations} onChange={(e) => set("locations", e.target.value)} placeholder={"Houston, TX\nNew Jersey\nAustin, TX | optional local fact to use as {{facts}}"} />
              </div>
            </div>
            <div className="space-y-5">
              <div><label className="label" htmlFor="tp">Page title pattern</label><input id="tp" className={`${field} font-mono text-sm`} value={f.titlePattern} placeholder={defaults.title} onChange={(e) => set("titlePattern", e.target.value)} /></div>
              <div><label className="label" htmlFor="mt">Meta title pattern</label><input id="mt" className={`${field} font-mono text-sm`} value={f.metaTitlePattern} placeholder={defaults.metaTitle} onChange={(e) => set("metaTitlePattern", e.target.value)} /></div>
              <div><label className="label" htmlFor="md">Meta description pattern</label><textarea id="md" className={`${field} font-mono text-sm`} rows={3} value={f.metaDescriptionPattern} placeholder={defaults.metaDescription} onChange={(e) => set("metaDescriptionPattern", e.target.value)} /></div>
              <div className="flex gap-5 text-sm"><label className="flex items-center gap-2"><input type="radio" checked={f.status === "draft"} onChange={() => set("status", "draft")} />Save as drafts (recommended)</label><label className="flex items-center gap-2"><input type="radio" checked={f.status === "published"} onChange={() => set("status", "published")} />Publish now</label></div>
              <div className="rounded border border-line p-4 text-xs text-fg2">
                <p className="mb-1.5 font-medium text-fg">Variables for your template and patterns</p>
                <p className="font-mono leading-relaxed">{"{{service}}  {{Service}}  {{industry}}  {{industries}}  {{Industries}}  {{location}}  {{city}}  {{state}}  {{facts}}"}</p>
                <p className="mt-2">Variations: <span className="font-mono">{"{Website design|Web development}"}</span> picks one option per page, so pages do not read identically.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded border border-warning/40 bg-warning/5 p-4 text-sm text-fg2">
            <p className="font-medium text-fg">Make each page worth publishing</p>
            <p className="mt-1">Search engines ignore or penalise pages that only swap a city name. Edit the template so it says something useful for each industry, add real local facts where you have them, publish in small batches and check the results. Never claim a local office or local clients you do not have.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn btn-ghost !py-2.5" onClick={() => run(true)} disabled={!!busy}>{busy === "preview" ? <Spinner /> : "Preview pages"}</button>
            <button className="btn btn-primary !py-2.5" onClick={() => run(false)} disabled={!!busy || !preview || preview.willCreate === 0}>{busy === "go" ? <Spinner /> : preview ? `Create ${preview.willCreate} page(s)` : "Create pages"}</button>
          </div>
          {preview && (
            <div className="glass mt-4 overflow-x-auto p-4"><p className="mb-3 text-sm text-fg2">{preview.total} page(s) planned, {preview.willCreate} will be created{preview.total > preview.items.length ? " (first 80 shown)" : ""}.</p>
              <table className="w-full min-w-[520px] text-sm"><tbody className="divide-y divide-line">{preview.items.map((i: any) => <tr key={i.slug}><td className="py-2">{i.title}</td><td className="font-mono text-xs text-muted">/{i.slug}</td><td className="text-right text-xs">{i.exists ? <span className="text-warning">exists, skipped</span> : <span className="text-success">new</span>}</td></tr>)}</tbody></table></div>
          )}

          <h2 className="mb-3 mt-10 text-xl font-semibold">Your location pages ({data.pages.length})</h2>
          {sel.length > 0 && <div className="glass mb-3 flex flex-wrap items-center gap-2 p-2.5 text-sm"><span className="px-2 text-fg2">{sel.length} selected</span><button className="btn btn-ghost !py-1.5" onClick={() => bulk("publish")}>Publish</button><button className="btn btn-ghost !py-1.5" onClick={() => bulk("draft")}>Set to draft</button><button className="btn btn-ghost !py-1.5 text-danger" onClick={() => bulk("trash")}>Move to trash</button></div>}
          {!data.pages.length ? <Empty title="No location pages yet">Fill in the form above and click Preview pages.</Empty> : (
            <div className="glass overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-line text-left text-fg2"><tr><th className="w-10 px-3 py-2.5"><input type="checkbox" aria-label="Select all" checked={sel.length === data.pages.length} onChange={(e) => setSel(e.target.checked ? data.pages.map((p) => p.id) : [])} /></th><th>Page</th><th>Service</th><th>Industry</th><th>Location</th><th>Status</th></tr></thead>
              <tbody className="divide-y divide-line">{data.pages.map((p) => (
                <tr key={p.id} className="hover:bg-raised/40"><td className="px-3"><input type="checkbox" aria-label={`Select ${p.title}`} checked={sel.includes(p.id)} onChange={(e) => setSel(e.target.checked ? [...sel, p.id] : sel.filter((x) => x !== p.id))} /></td>
                  <td className="py-2.5"><Link href={`/admin/c/pages/${p.id}`} className="font-medium text-fg hover:text-accent">{p.title}</Link><div className="font-mono text-xs text-muted">/{p.slug}</div></td>
                  <td className="text-fg2">{p.location.service}</td><td className="text-fg2">{p.location.industry || "none"}</td><td className="text-fg2">{p.location.label}</td>
                  <td><span className={`chip !py-0.5 ${p.status === "published" ? "!text-success" : ""}`}>{p.status === "published" ? "Published" : "Draft"}</span></td></tr>
              ))}</tbody></table></div>
          )}
        </>
      )}
    </>
  );
}
