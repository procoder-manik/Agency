"use client";
import { useEffect, useState } from "react";
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

const COLS = [["new", "New"], ["contacted", "Contacted"], ["won", "Won"], ["lost", "Lost"]];
export function Leads() {
  const [items, setItems] = useState<any[]>([]); const [q, setQ] = useState(""); const [edit, setEdit] = useState<any>(null);
  const load = () => apiFetch("/api/admin/leads").then((r) => setItems(r.items)).catch((e) => toast(e.message, "error"));
  useEffect(() => { load(); }, []);
  async function save(l: any) {
    try { const r = await apiFetch("/api/admin/leads", { method: l.id ? "PUT" : "POST", json: l }); setItems((x) => (l.id ? x.map((i) => (i.id === l.id ? r.item : i)) : [r.item, ...x])); setEdit(null); toast("Lead saved."); } catch (e: any) { toast(e.message, "error"); }
  }
  const move = (l: any, status: string) => save({ ...l, status });
  const list = items.filter((i) => !q || [i.name, i.email, i.company, i.notes].join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Leads" sub="A simple pipeline. Drag a card or use its menu to change status."><input className="input max-w-xs" placeholder="Search leads" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn btn-primary !py-2 text-sm" onClick={() => setEdit({ status: "new", source: "manual" })}>Add lead</button></PageHead>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map(([k, label]) => (
          <div key={k} className="rounded border border-line bg-surface/40 p-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = Number(e.dataTransfer.getData("id")); const l = items.find((x) => x.id === id); if (l && l.status !== k) move(l, k); }}>
            <p className="mb-3 flex justify-between px-1 font-medium">{label}<span className="text-muted">{list.filter((l) => l.status === k).length}</span></p>
            <div className="space-y-2">
              {list.filter((l) => l.status === k).map((l) => (
                <div key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", String(l.id))} className="glass cursor-grab p-3 text-sm">
                  <button className="block w-full text-left" onClick={() => setEdit({ ...l })}><p className="font-medium text-fg">{l.name || l.email || "Unnamed"}</p><p className="text-fg2">{[l.company, l.email].filter(Boolean).join(" · ")}</p>{l.notes && <p className="mt-1 line-clamp-2 text-xs text-muted">{l.notes}</p>}</button>
                  <div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted">{l.source}</span>
                    <select aria-label="Status" className="rounded border border-line bg-bg px-1 text-xs" value={l.status} onChange={(e) => move(l, e.target.value)}>{COLS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit lead" : "Add lead"}>
        {edit && <div className="grid gap-3 sm:grid-cols-2">
          {["name", "email", "phone", "company", "source"].map((k) => <div key={k}><label className="label capitalize">{k}</label><input className="input" value={edit[k] || ""} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></div>)}
          <div><label className="label">Status</label><select className="input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{COLS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea className="input" rows={5} value={edit.notes || ""} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></div>
          <div className="flex gap-2 sm:col-span-2"><button className="btn btn-primary" onClick={() => save(edit)}>Save lead</button>
            {edit.id && <button className="btn btn-ghost text-danger" onClick={async () => { if (!confirm("Delete this lead?")) return; await apiFetch(`/api/admin/leads?id=${edit.id}`, { method: "DELETE" }); setItems((x) => x.filter((i) => i.id !== edit.id)); setEdit(null); }}>Delete</button>}</div>
        </div>}
      </Modal>
    </>
  );
}
