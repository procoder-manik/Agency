"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, Empty, PageHead, Spinner, toast } from "./ui";

/** WordPress-style tag list for one content type: counts, rename, delete. Tags are created by typing them on an item. */
export function TagsAdmin({ collection, label, listHref }: { collection: string; label: string; listHref: string }) {
  const [items, setItems] = useState<any[] | null>(null); const [edit, setEdit] = useState<string | null>(null); const [val, setVal] = useState(""); const [q, setQ] = useState("");
  const load = () => apiFetch(`/api/admin/tags?collection=${collection}`).then((r) => setItems(r.items)).catch((e) => { toast(e.message, "error"); setItems([]); });
  useEffect(() => { load(); }, [collection]); // eslint-disable-line
  async function rename(from: string) {
    if (!val.trim() || val.trim() === from) return setEdit(null);
    try { const r = await apiFetch("/api/admin/tags", { method: "POST", json: { collection, from, to: val } }); toast(`Renamed on ${r.updated} item${r.updated === 1 ? "" : "s"}.`); setEdit(null); load(); } catch (e: any) { toast(e.message, "error"); }
  }
  async function del(t: any) {
    if (!confirm(`Remove the tag "${t.name}" from ${t.count} item${t.count === 1 ? "" : "s"}? The items themselves are kept.`)) return;
    try { await apiFetch(`/api/admin/tags?collection=${collection}&tag=${encodeURIComponent(t.name)}`, { method: "DELETE" }); toast("Tag removed."); load(); } catch (e: any) { toast(e.message, "error"); }
  }
  const list = (items || []).filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title={`${label} tags`} sub={`Tags are short keywords. Add them in the Tags field when you edit a ${label.toLowerCase().replace(/s$/, "")}; they show up here with a count so you can rename or remove them.`}>
        <input className="input max-w-xs" placeholder="Search tags" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tags" />
        <Link href={listHref} className="btn btn-ghost !py-2 text-sm">All {label.toLowerCase()}</Link>
      </PageHead>
      {items === null ? <p className="flex items-center gap-2 text-fg2"><Spinner /> Loading…</p> : !list.length ? <Empty title="No tags yet">Type tags in the Tags field of any {label.toLowerCase().replace(/s$/, "")} and they appear here.</Empty> : (
        <div className="glass divide-y divide-line">{list.map((t) => (
          <div key={t.name} className="flex flex-wrap items-center gap-3 p-4">
            {edit === t.name
              ? <><input autoFocus className="input max-w-xs" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") rename(t.name); if (e.key === "Escape") setEdit(null); }} aria-label="New tag name" /><button className="btn btn-primary !py-1.5 text-sm" onClick={() => rename(t.name)}>Save</button><button className="text-sm text-fg2" onClick={() => setEdit(null)}>Cancel</button></>
              : <><span className="chip !text-fg">{t.name}</span><span className="text-sm text-fg2">{t.count} item{t.count === 1 ? "" : "s"}</span>
                <span className="hidden truncate text-xs text-muted md:block">{t.items.map((i: any) => i.title).join(", ")}</span>
                <span className="ml-auto flex gap-4 text-sm"><button className="text-accent hover:underline" onClick={() => { setEdit(t.name); setVal(t.name); }}>Rename</button><button className="text-danger hover:underline" onClick={() => del(t)}>Remove</button></span></>}
          </div>))}</div>
      )}
    </>
  );
}
