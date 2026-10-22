"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch, Empty, PageHead, Spinner, toast } from "./ui";
import { MediaThumb, useUpload, type MediaItem } from "./MediaPicker";

const SLOTS = [["Cover / blog image", "1600 × 900 (16:9)"], ["Social share", "1200 × 630 (1.91:1)"], ["Case study cover", "1200 × 1500 (4:5)"], ["Hero media", "1600 × 1000 (16:10)"], ["Work screenshot", "1440 × 900 (16:10)"], ["Team photo", "800 × 800 (1:1)"], ["Client logo", "320 × 120"]];

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]); const [q, setQ] = useState(""); const [loading, setLoading] = useState(true); const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = () => { setLoading(true); apiFetch(`/api/admin/media?q=${encodeURIComponent(q)}`).then((r) => setItems(r.items)).catch((e) => toast(e.message, "error")).finally(() => setLoading(false)); };
  useEffect(load, []); // eslint-disable-line
  const { upload, busy } = useUpload((n) => setItems((l) => [...n, ...l]));
  const saveAlt = async (m: MediaItem, alt: string) => { if (alt === m.alt) return; try { await apiFetch("/api/admin/media", { method: "PUT", json: { id: m.id, alt } }); setItems((l) => l.map((x) => (x.id === m.id ? { ...x, alt } : x))); toast("Alt text saved."); } catch (e: any) { toast(e.message, "error"); } };
  const del = async (m: MediaItem) => { if (!confirm("Move this file to the trash? Pages that use it will show it as missing.")) return; await apiFetch(`/api/admin/media?id=${m.id}`, { method: "DELETE" }); setItems((l) => l.filter((x) => x.id !== m.id)); };
  return (
    <>
      <PageHead title="Media library" sub="Images, GIFs, MP4/WebM loops and Lottie JSON. JPG and PNG are converted to WebP automatically.">
        <button className="btn btn-primary !py-2 text-sm" onClick={() => input.current?.click()} disabled={busy}>{busy ? <Spinner /> : "Upload files"}</button>
        <input ref={input} type="file" multiple hidden accept="image/*,video/mp4,video/webm,.json" onChange={(e) => upload(e.target.files)} />
      </PageHead>
      <details className="glass mb-5 p-4 text-sm"><summary className="cursor-pointer font-medium">Image sizes used on the site</summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{SLOTS.map(([a, b]) => <p key={a} className="text-fg2"><span className="text-fg">{a}:</span> {b}</p>)}</div></details>
      <input className="input mb-5 max-w-sm" placeholder="Search by file name or alt text" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} aria-label="Search media" />
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }} className={`rounded transition-colors ${drag ? "outline outline-2 outline-accent" : ""}`}>
        {loading ? <p className="text-fg2">Loading…</p> : !items.length ? <Empty title="No files yet">Drag files here or use Upload files.</Empty> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <div key={m.id} className="glass overflow-hidden">
                <MediaThumb url={m.url} className="aspect-[4/3] w-full" />
                <div className="space-y-2 p-3">
                  <p className="truncate text-xs text-muted">{m.filename}{m.width ? ` · ${m.width}×${m.height}` : ""}{m.size ? ` · ${Math.round(m.size / 1024)} KB` : ""}</p>
                  <input className={`input !py-1.5 text-sm ${!m.alt ? "!border-warning/60" : ""}`} defaultValue={m.alt} placeholder="Alt text (required)" onBlur={(e) => saveAlt(m, e.target.value)} aria-label={`Alt text for ${m.filename}`} />
                  <div className="flex justify-between text-xs"><button className="text-accent hover:underline" onClick={() => { navigator.clipboard.writeText(location.origin + m.url); toast("URL copied."); }}>Copy URL</button><button className="text-danger hover:underline" onClick={() => del(m)}>Delete</button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
