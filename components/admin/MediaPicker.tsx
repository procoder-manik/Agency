"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch, Modal, Spinner, toast } from "./ui";
import { mediaKind } from "@/lib/media";

export interface MediaItem { id: number; url: string; filename: string; mime: string; width?: number | null; height?: number | null; alt: string; size?: number }

export function MediaThumb({ url, className = "" }: { url: string; className?: string }) {
  const k = mediaKind(url);
  if (k === "video") return <video src={url} muted loop autoPlay playsInline className={`object-cover ${className}`} />;
  if (k === "lottie") return <div className={`grid place-items-center bg-raised text-xs text-fg2 ${className}`}>Lottie</div>;
  if (k === "youtube") return <div className={`grid place-items-center bg-raised text-xs text-fg2 ${className}`}>YouTube</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={`object-cover ${className}`} loading="lazy" />;
}

export function useUpload(onDone: (items: MediaItem[]) => void) {
  const [busy, setBusy] = useState(false);
  async function upload(files: FileList | File[] | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const fd = new FormData(); Array.from(files).forEach((f) => fd.append("file", f));
      const r = await apiFetch<{ items: MediaItem[] }>("/api/admin/media", { method: "POST", body: fd });
      onDone(r.items); toast(`Uploaded ${r.items.length} file(s). Add alt text so screen readers can describe them.`);
    } catch (e: any) { toast(e.message, "error"); }
    setBusy(false);
  }
  return { upload, busy };
}

export function MediaPicker({ open, onClose, onPick, accept = "all" }: { open: boolean; onClose: () => void; onPick: (m: MediaItem) => void; accept?: "image" | "all" }) {
  const [items, setItems] = useState<MediaItem[]>([]); const [q, setQ] = useState(""); const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = () => { setLoading(true); apiFetch<{ items: MediaItem[] }>(`/api/admin/media?q=${encodeURIComponent(q)}`).then((r) => setItems(r.items)).catch((e) => toast(e.message, "error")).finally(() => setLoading(false)); };
  useEffect(() => { if (open) load(); }, [open]); // eslint-disable-line
  const { upload, busy } = useUpload((n) => setItems((l) => [...n, ...l]));
  const list = items.filter((m) => accept === "all" || m.mime.startsWith("image/"));
  return (
    <Modal open={open} onClose={onClose} title="Media library" wide>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search files or alt text" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        <button className="btn btn-ghost !py-2" onClick={load}>Search</button>
        <button className="btn btn-primary !py-2" onClick={() => input.current?.click()} disabled={busy}>{busy ? <Spinner /> : "Upload"}</button>
        <input ref={input} type="file" multiple hidden accept={accept === "image" ? "image/*" : "image/*,video/mp4,video/webm,.json"} onChange={(e) => upload(e.target.files)} />
      </div>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-5">
        {loading && <p className="col-span-full text-fg2">Loading…</p>}
        {!loading && !list.length && <p className="col-span-full rounded border border-dashed border-line p-10 text-center text-fg2">Drop files here or use Upload.</p>}
        {list.map((m) => (
          <button key={m.id} onClick={() => { onPick(m); onClose(); }} className="group overflow-hidden rounded border border-line text-left hover:border-accent">
            <MediaThumb url={m.url} className="aspect-square w-full" />
            <p className="truncate px-2 py-1.5 text-xs text-fg2">{m.alt || <span className="text-warning">No alt text</span>}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
