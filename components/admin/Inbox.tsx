"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LEAD_HELP, LEAD_LABELS, LEAD_STATUSES } from "@/lib/lead-status";
import { apiFetch, Empty, fmt, Modal, PageHead, toast } from "./ui";

export function Submissions() {
  const [items, setItems] = useState<any[]>([]); const [q, setQ] = useState(""); const [filter, setFilter] = useState("all"); const [open, setOpen] = useState<any>(null);
  const load = () => apiFetch("/api/admin/submissions").then((r) => setItems(r.items)).catch((e) => toast(e.message, "error"));
  useEffect(() => { load(); }, []);
  const mark = async (ids: number[], read: boolean) => { await apiFetch("/api/admin/submissions", { method: "PUT", json: { ids, read } }); setItems((l) => l.map((x) => (ids.includes(x.id) ? { ...x, read } : x))); };
  const list = items.filter((i) => (filter === "all" || (filter === "unread" ? !i.read : i.read)) && (!q || JSON.stringify(i.values).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHead title="Form submissions" sub="Every form submission is saved here and copied to Leads.">
        <a href="/api/admin/submissions?format=csv" className="btn btn-ghost !py-2 text-sm">Export CSV</a>
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => mark(items.filter((i) => !i.read).map((i) => i.id), true)}>Mark all read</button>
      </PageHead>
      <div className="mb-4 flex flex-wrap gap-2">{["all", "unread", "read"].map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded px-3 py-1.5 text-sm capitalize ${filter === f ? "bg-raised text-fg" : "text-fg2"}`}>{f}</button>)}<input className="input ml-auto max-w-xs" placeholder="Search submissions" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {!list.length ? <Empty title="No submissions yet">They appear here when someone fills in a form on the site.</Empty> : (
        <div className="glass divide-y divide-line">
          {list.map((s) => (
            <button key={s.id} onClick={() => { setOpen(s); if (!s.read) mark([s.id], true); }} className="flex w-full items-start gap-3 p-4 text-left hover:bg-raised/40">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.read ? "bg-transparent" : "bg-accent"}`} aria-label={s.read ? "Read" : "Unread"} />
              <span className="min-w-0 flex-1"><span className={`block ${s.read ? "text-fg2" : "font-semibold text-fg"}`}>{s.values.name || s.values.email || "Anonymous"} <span className="font-normal text-muted">via {s.formName}</span></span><span className="block truncate text-sm text-fg2">{s.values.message || Object.values(s.values).join(" · ")}</span></span>
              <span className="shrink-0 text-xs text-muted">{fmt(s.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title={`Submission from ${open?.values?.name || "visitor"}`}>
        {open && <><dl className="space-y-3">{Object.entries(open.values).map(([k, v]) => <div key={k}><dt className="text-xs capitalize text-muted">{k}</dt><dd className="whitespace-pre-wrap text-fg">{String(v)}</dd></div>)}</dl>
          <div className="mt-6 flex gap-2">{open.values.email && <a className="btn btn-primary !py-2 text-sm" href={`mailto:${open.values.email}`}>Reply by email</a>}<button className="btn btn-ghost !py-2 text-sm" onClick={() => { mark([open.id], false); setOpen(null); }}>Mark unread</button>
            <button className="btn btn-ghost !py-2 text-sm text-danger" onClick={async () => { await apiFetch(`/api/admin/submissions?id=${open.id}`, { method: "DELETE" }); setItems((l) => l.filter((x) => x.id !== open.id)); setOpen(null); }}>Delete</button></div></>}
      </Modal>
    </>
  );
}

const COLS = LEAD_STATUSES.map((k) => [k, LEAD_LABELS[k]] as const);
const Badges = ({ l }: { l: any }) => (
  <span className="flex flex-wrap items-center gap-1.5">
    {l.status === "new" && <span className="chip !border-accent/50 !px-2 !py-0.5 !text-[0.7rem] !text-accent">New</span>}
    {l.verified ? <span className="chip !px-2 !py-0.5 !text-[0.7rem] !text-success">Verified</span> : l.email ? <span className="chip !px-2 !py-0.5 !text-[0.7rem]">Unverified</span> : null}
    {l.unsubscribed && <span className="chip !px-2 !py-0.5 !text-[0.7rem] !text-danger">Unsubscribed</span>}
    {l.contactCount > 1 && <span className="chip !px-2 !py-0.5 !text-[0.7rem]">{l.contactCount} messages</span>}
  </span>
);

export function Leads() {
  const [items, setItems] = useState<any[]>([]); const [q, setQ] = useState(""); const [edit, setEdit] = useState<any>(null);
  const [view, setView] = useState<"board" | "list">("board"); const [sel, setSel] = useState<number[]>([]); const [filter, setFilter] = useState("all");
  const load = () => apiFetch("/api/admin/leads").then((r) => setItems(r.items)).catch((e) => toast(e.message, "error"));
  useEffect(() => { load(); try { const v = localStorage.getItem("leads:view"); if (v === "list" || v === "board") setView(v); } catch {} }, []);
  const setViewP = (v: "board" | "list") => { setView(v); try { localStorage.setItem("leads:view", v); } catch {} };
  async function save(l: any) {
    try { const r = await apiFetch("/api/admin/leads", { method: l.id ? "PUT" : "POST", json: l }); setItems((x) => (l.id ? x.map((i) => (i.id === l.id ? r.item : i)) : [r.item, ...x])); setEdit(null); toast("Lead saved."); } catch (e: any) { toast(e.message, "error"); }
  }
  async function bulk(body: any, msg: string) {
    try { await apiFetch("/api/admin/leads/bulk", { method: "POST", json: { ids: sel, ...body } }); toast(msg); setSel([]); load(); } catch (e: any) { toast(e.message, "error"); }
  }
  const move = (l: any, status: string) => save({ ...l, status });
  const list = items.filter((i) => (filter === "all" || i.status === filter) && (!q || [i.name, i.email, i.company, i.notes].join(" ").toLowerCase().includes(q.toLowerCase())));
  const total = items.length, fresh = items.filter((i) => i.status === "new").length, verified = items.filter((i) => i.verified && !i.unsubscribed).length;
  const allSel = list.length > 0 && list.every((l) => sel.includes(l.id));
  return (
    <>
      <PageHead title="Leads" sub="Every email address is one lead. New leads stay under New for 7 days, then move to Contacts on their own.">
        <input className="input max-w-xs" placeholder="Search leads" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
        <div className="flex rounded-full border border-line p-0.5 text-sm">{(["board", "list"] as const).map((v) => <button key={v} onClick={() => setViewP(v)} className={`rounded-full px-3.5 py-1 capitalize ${view === v ? "bg-accent text-onaccent" : "text-fg2"}`}>{v}</button>)}</div>
        <a href="/api/admin/leads?format=csv" className="btn btn-ghost !py-2 text-sm">Export CSV</a>
        <Link href="/admin/email?new=1" className="btn btn-ghost !py-2 text-sm">Send campaign</Link>
        <button className="btn btn-primary !py-2 text-sm" onClick={() => setEdit({ status: "new", source: "manual" })}>Add lead</button>
      </PageHead>
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {[["Total leads", total], ["New (last 7 days)", fresh], ["Verified, can receive campaigns", verified], ["Customers", items.filter((i) => i.status === "won").length]].map(([l, n]) => <div key={l as string} className="glass p-4"><p className="text-sm text-fg2">{l}</p><p className="font-display text-3xl font-bold">{n}</p></div>)}
      </div>

      {view === "board" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLS.map(([k, label]) => {
            const col = list.filter((l) => l.status === k);
            return (
              <div key={k} className="rounded-[var(--r-md)] border border-line bg-surface/40 p-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = Number(e.dataTransfer.getData("id")); const l = items.find((x) => x.id === id); if (l && l.status !== k) move(l, k); }}>
                <p className="flex justify-between px-1 font-medium">{label}<span className="text-muted">{col.length}</span></p>
                <p className="mb-3 px-1 text-xs text-muted">{LEAD_HELP[k]}</p>
                <div className="space-y-2">
                  {col.map((l) => (
                    <div key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", String(l.id))} className="glass cursor-grab p-3 text-sm">
                      <button className="block w-full text-left" onClick={() => setEdit({ ...l })}><p className="font-medium text-fg">{l.name || l.email || "Unnamed"}</p><p className="break-all text-fg2">{[l.company, l.email].filter(Boolean).join(" · ")}</p>{l.notes && <p className="mt-1 line-clamp-2 text-xs text-muted">{l.notes}</p>}</button>
                      <div className="mt-2"><Badges l={l} /></div>
                      <div className="mt-2 flex items-center justify-between"><span className="truncate text-xs text-muted">{l.source}</span>
                        <select aria-label="Status" className="rounded border border-line bg-bg px-1 text-xs" value={l.status} onChange={(e) => move(l, e.target.value)}>{COLS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2">{[["all", "All"], ...COLS].map(([v, l]) => <button key={v} onClick={() => { setFilter(v); setSel([]); }} className={`chip ${filter === v ? "!border-accent !text-fg" : ""}`}>{l}</button>)}</div>
          {sel.length > 0 && (
            <div className="glass mb-3 flex flex-wrap items-center gap-2 p-3 text-sm">
              <span className="font-medium">{sel.length} selected</span>
              <select className="input !w-auto !py-1.5 text-sm" value="" onChange={(e) => e.target.value && bulk({ status: e.target.value }, "Status updated.")} aria-label="Move to"><option value="">Move to…</option>{COLS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => bulk({ verified: true }, "Marked verified.")}>Mark verified</button>
              <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => bulk({ unsubscribed: true }, "Marked unsubscribed.")}>Unsubscribe</button>
              <Link href={`/admin/email?ids=${sel.join(",")}`} className="btn btn-primary !py-1.5 text-sm">Email selected</Link>
              <button className="btn btn-ghost !py-1.5 text-sm text-danger" onClick={() => confirm(`Delete ${sel.length} lead(s)?`) && bulk({ action: "delete" }, "Deleted.")}>Delete</button>
              <button className="ml-auto text-fg2 hover:text-fg" onClick={() => setSel([])}>Clear</button>
            </div>
          )}
          {!list.length ? <Empty title="No leads here">Leads appear when someone fills in a form or the chat.</Empty> : (
            <div className="glass overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
              <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="w-10 p-3"><input type="checkbox" checked={allSel} onChange={(e) => setSel(e.target.checked ? list.map((l) => l.id) : [])} aria-label="Select all" /></th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3">Email</th><th className="p-3">Source</th><th className="p-3">Added</th></tr></thead>
              <tbody className="divide-y divide-line">{list.map((l) => (
                <tr key={l.id} className="hover:bg-raised/40">
                  <td className="p-3"><input type="checkbox" checked={sel.includes(l.id)} onChange={(e) => setSel(e.target.checked ? [...sel, l.id] : sel.filter((x) => x !== l.id))} aria-label={`Select ${l.name || l.email}`} /></td>
                  <td className="p-3"><button className="text-left" onClick={() => setEdit({ ...l })}><span className="block font-medium text-fg">{l.name || l.email || "Unnamed"}</span><span className="block text-fg2">{[l.company, l.email].filter(Boolean).join(" · ")}</span></button></td>
                  <td className="p-3"><select aria-label="Status" className="rounded border border-line bg-bg px-1.5 py-1 text-xs" value={l.status} onChange={(e) => move(l, e.target.value)}>{COLS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></td>
                  <td className="p-3"><Badges l={l} /></td>
                  <td className="p-3 text-fg2">{l.source}</td><td className="p-3 whitespace-nowrap text-xs text-muted">{fmt(l.createdAt)}</td>
                </tr>))}</tbody></table></div>
          )}
        </>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit lead" : "Add lead"}>
        {edit && <div className="grid gap-3 sm:grid-cols-2">
          {["name", "email", "phone", "company", "source"].map((k) => <div key={k}><label className="label capitalize">{k}</label><input className="input" value={edit[k] || ""} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></div>)}
          <div><label className="label">Status</label><select className="input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{COLS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.verified} onChange={(e) => setEdit({ ...edit, verified: e.target.checked })} /> Email is verified</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.unsubscribed} onChange={(e) => setEdit({ ...edit, unsubscribed: e.target.checked })} /> Unsubscribed from emails</label>
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea className="input" rows={6} value={edit.notes || ""} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></div>
          <div className="flex flex-wrap gap-2 sm:col-span-2"><button className="btn btn-primary" onClick={() => save(edit)}>Save lead</button>
            {edit.id && edit.email && <Link className="btn btn-ghost" href={`/admin/email?ids=${edit.id}`}>Send an email</Link>}
            {edit.id && <button className="btn btn-ghost text-danger" onClick={async () => { if (!confirm("Delete this lead?")) return; await apiFetch(`/api/admin/leads?id=${edit.id}`, { method: "DELETE" }); setItems((x) => x.filter((i) => i.id !== edit.id)); setEdit(null); }}>Delete</button>}</div>
        </div>}
      </Modal>
    </>
  );
}
