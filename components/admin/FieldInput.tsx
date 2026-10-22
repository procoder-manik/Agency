"use client";
import { useEffect, useId, useState } from "react";
import { marked } from "marked";
import { aiAllowed, type Field } from "@/lib/fields";
import { mediaUrl } from "@/lib/media";
import { apiFetch, Modal, Spinner, toast } from "./ui";
import { MediaPicker, MediaThumb } from "./MediaPicker";
import { useAdmin, useItem } from "./context";

/* ---------- relation options cache ---------- */
const relCache = new Map<string, Promise<{ id: number; title: string }[]>>();
export function useRelation(collection?: string) {
  const [opts, setOpts] = useState<{ id: number; title: string }[]>([]);
  useEffect(() => {
    if (!collection) return;
    if (!relCache.has(collection)) relCache.set(collection, apiFetch(`/api/admin/entries?collection=${collection}`).then((r: any) => r.items.map((i: any) => ({ id: i.id, title: i.title + (i.status === "draft" ? " (draft)" : "") }))).catch(() => []));
    relCache.get(collection)!.then(setOpts);
  }, [collection]);
  return opts;
}

/* ---------- Write with AI ---------- */
export function AiButton({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const { aiOn } = useAdmin(); const { collection, item } = useItem();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(""); const [instr, setInstr] = useState("");
  if (!aiAllowed(field)) return null;
  async function go(mode: string) {
    setBusy(mode);
    try {
      const r = await apiFetch("/api/admin/ai", { method: "POST", json: { task: "field", mode, label: field.label, type: field.type, current: value || "", instruction: instr, item: { collection, ...item } } });
      onChange(r.data.text); setOpen(false); toast(`Written with ${r.provider}. Review before publishing.`);
    } catch (e: any) { toast(e.message, "error"); }
    setBusy("");
  }
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} disabled={!aiOn} title={aiOn ? "Write with AI" : "Add an AI key in Admin > AI to enable"} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-fg2 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40">✦ AI</button>
      {open && (
        <div className="glass absolute right-0 top-8 z-30 w-72 !bg-surface p-3 shadow-xl">
          <input className="input mb-2 !py-1.5 text-sm" placeholder="Optional instruction (tone, focus…)" value={instr} onChange={(e) => setInstr(e.target.value)} />
          <div className="flex gap-1.5">
            {["write", "improve", "shorten"].map((m) => <button key={m} type="button" disabled={!!busy || (m !== "write" && !value)} onClick={() => go(m)} className="btn btn-ghost flex-1 !px-2 !py-1.5 text-xs capitalize disabled:opacity-40">{busy === m ? <Spinner /> : m}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- cover image prompt writer ---------- */
function PromptWriter({ field }: { field: Field }) {
  const { aiOn, colors } = useAdmin(); const { item } = useItem();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [prompts, setPrompts] = useState<string[]>([]);
  async function go() {
    setOpen(true); setBusy(true); setPrompts([]);
    try {
      const r = await apiFetch("/api/admin/ai", { method: "POST", json: { task: "coverPrompts", size: field.size, title: item.title, summary: item.data?.summary || item.data?.excerpt || item.data?.subheading || "", colors: { accent: colors.accent, accent2: colors.accent2, background: colors.bg }, hasScreenshot: !!mediaUrl(item.data?.screenshot) } });
      setPrompts(r.data.prompts || []);
    } catch (e: any) { toast(e.message, "error"); setOpen(false); }
    setBusy(false);
  }
  if (!field.size) return null;
  return (
    <>
      <button type="button" onClick={go} disabled={!aiOn} className="text-xs text-accent hover:underline disabled:opacity-40">Write image prompts</button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Image prompts for ${field.size}`}>
        {busy && <p className="flex items-center gap-2 text-fg2"><Spinner /> Writing prompts…</p>}
        <div className="space-y-3">{prompts.map((p, i) => (
          <div key={i} className="rounded border border-line p-3 text-sm"><p className="whitespace-pre-wrap text-fg2">{p}</p>
            <button className="mt-2 text-xs text-accent hover:underline" onClick={() => { navigator.clipboard.writeText(p); toast("Prompt copied."); }}>Copy prompt</button></div>
        ))}</div>
        {prompts.length > 0 && <p className="mt-4 text-xs text-muted">Paste into ChatGPT, Gemini or Midjourney, then upload the result here.</p>}
      </Modal>
    </>
  );
}

/* ---------- the field renderer ---------- */
export function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-fg2">{field.label}{field.size && <span className="ml-2 font-normal text-muted">Recommended {field.size}</span>}</label>
        <div className="flex items-center gap-3">{(field.type === "image" || field.type === "media") && <PromptWriter field={field} />}<AiButton field={field} value={value} onChange={onChange} /></div>
      </div>
      <Control id={id} field={field} value={value} onChange={onChange} />
      {field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}
    </div>
  );
}

function Control({ id, field: f, value, onChange }: { id: string; field: Field; value: any; onChange: (v: any) => void }) {
  const [preview, setPreview] = useState(false); const [pick, setPick] = useState(false); const [tag, setTag] = useState("");
  const rel = useRelation(f.type === "relation" ? f.collection : undefined);
  switch (f.type) {
    case "textarea": return <textarea id={id} className="input min-h-[90px]" rows={3} value={value || ""} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "markdown": return (
      <div>
        <div className="mb-1 flex gap-3 text-xs"><button type="button" className={!preview ? "text-accent" : "text-fg2"} onClick={() => setPreview(false)}>Write</button><button type="button" className={preview ? "text-accent" : "text-fg2"} onClick={() => setPreview(true)}>Preview</button><span className="text-muted">Markdown: ## heading, **bold**, - list, [link](/path)</span></div>
        {preview ? <div className="prose-site input min-h-[160px] !max-w-none" dangerouslySetInnerHTML={{ __html: String(marked.parse(value || "", { async: false })).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "") }} />
          : <textarea id={id} className="input min-h-[160px] font-mono text-sm" rows={8} value={value || ""} onChange={(e) => onChange(e.target.value)} />}
      </div>
    );
    case "number": return <input id={id} type="number" className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
    case "date": return <input id={id} type="date" className="input" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} />;
    case "color": return <div className="flex items-center gap-2"><input id={id} type="color" className="h-10 w-14 cursor-pointer rounded border border-line bg-transparent" value={value || "#3d8bff"} onChange={(e) => onChange(e.target.value)} /><input className="input max-w-[140px] font-mono" value={value || ""} placeholder="#RRGGBB" onChange={(e) => onChange(e.target.value)} />{value && <button type="button" className="text-xs text-fg2" onClick={() => onChange("")}>Clear</button>}</div>;
    case "toggle": return <button id={id} type="button" role="switch" aria-checked={!!value} onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full border transition-colors ${value ? "border-accent bg-accent" : "border-line bg-raised"}`}><span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all ${value ? "left-[22px] bg-onaccent" : "left-0.5 bg-fg"}`} /></button>;
    case "select": return <select id={id} className="input" value={value || ""} onChange={(e) => onChange(e.target.value)}><option value="">Choose…</option>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
    case "relation":
      if (f.multiple) {
        const sel: number[] = (Array.isArray(value) ? value : []).map(Number);
        return <div className="input flex max-h-48 flex-col gap-1.5 overflow-y-auto">{rel.length === 0 && <span className="text-sm text-muted">Nothing to pick yet.</span>}{rel.map((o) => <label key={o.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sel.includes(o.id)} onChange={(e) => onChange(e.target.checked ? [...sel, o.id] : sel.filter((x) => x !== o.id))} />{o.title}</label>)}</div>;
      }
      return <select id={id} className="input" value={value || ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}><option value="">None</option>{rel.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>;
    case "tags": {
      const list: string[] = Array.isArray(value) ? value : [];
      const add = () => { const t = tag.trim(); if (t && !list.includes(t)) onChange([...list, t]); setTag(""); };
      return (
        <div className="input flex flex-wrap items-center gap-1.5 !py-1.5">
          {list.map((t, i) => <span key={t} className="chip !py-0.5">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(list.filter((_, j) => j !== i))} className="text-muted hover:text-danger">✕</button></span>)}
          <input id={id} className="min-w-[120px] flex-1 bg-transparent py-1 outline-none" value={tag} placeholder="Type and press Enter" onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } if (e.key === "Backspace" && !tag && list.length) onChange(list.slice(0, -1)); }} onBlur={add} />
        </div>
      );
    }
    case "image": case "media": {
      const url = mediaUrl(value); const alt = typeof value === "object" && value ? value.alt || "" : "";
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="h-24 w-36 shrink-0 overflow-hidden rounded border border-line bg-raised">{url ? <MediaThumb url={url} className="h-full w-full" /> : <div className="grid h-full place-items-center text-xs text-muted">No {f.type === "media" ? "media" : "image"}</div>}</div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-ghost !py-1.5 text-sm" onClick={() => setPick(true)}>Choose from library</button>{url && <button type="button" className="btn btn-ghost !py-1.5 text-sm" onClick={() => onChange("")}>Remove</button>}</div>
            <input id={id} className="input !py-1.5 text-sm" placeholder={f.type === "media" ? "…or paste an image, GIF, MP4/WebM, Lottie JSON or YouTube URL" : "…or paste an image URL"} value={url} onChange={(e) => onChange(e.target.value ? { url: e.target.value, alt } : "")} />
            {url && <input className="input !py-1.5 text-sm" placeholder="Alt text (describe the image)" value={alt} onChange={(e) => onChange({ url, alt: e.target.value })} />}
          </div>
          <MediaPicker open={pick} onClose={() => setPick(false)} accept={f.type === "image" ? "image" : "all"} onPick={(m) => onChange({ url: m.url, alt: m.alt })} />
        </div>
      );
    }
    case "list": {
      const items: any[] = Array.isArray(value) ? value : [];
      const set = (i: number, v: any) => onChange(items.map((x, j) => (j === i ? v : x)));
      const move = (i: number, d: number) => { const n = [...items]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
      return (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="rounded border border-line bg-bg/40 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>#{i + 1}</span><span className="flex gap-2">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="disabled:opacity-30">↑</button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="disabled:opacity-30">↓</button>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-danger">Remove</button></span></div>
              <div className="grid gap-3 sm:grid-cols-2">{f.fields!.map((sf) => <div key={sf.name} className={["textarea", "markdown", "media", "image"].includes(sf.type) ? "sm:col-span-2" : ""}><FieldInput field={sf} value={it?.[sf.name]} onChange={(v) => set(i, { ...it, [sf.name]: v })} /></div>)}</div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost !py-1.5 text-sm" onClick={() => onChange([...items, {}])}>Add {f.label.toLowerCase().replace(/s$/, "")}</button>
        </div>
      );
    }
    default: return <input id={id} type={f.type === "url" ? "text" : "text"} className="input" value={value || ""} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}
