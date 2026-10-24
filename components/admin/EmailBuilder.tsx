"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, Modal, Spinner, Toggle, toast } from "./ui";
import { MediaPicker } from "./MediaPicker";
import { AltAiButton } from "./FieldInput";
import { BLOCK_TYPES, cleanRich, defaultSettings, newBlock, renderEmail, uid, type CardItem, type EBlock, type EmailBrand, type EmailDoc } from "@/lib/email-blocks";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/util";

export interface EditorValue { subject: string; preheader: string; html: string; blocks: EmailDoc | null }
const VARS = ["firstName", "name", "email", "company", "siteName", "siteUrl", "unsubscribeUrl", "verifyUrl", "year"];
const sampleFill = (h: string) => { const S: Record<string, string> = { firstName: "Alex", name: "Alex Example", email: "alex@example.com", company: "Example Co", siteName: "Your Agency", siteUrl: typeof location !== "undefined" ? location.origin : "", unsubscribeUrl: "#", verifyUrl: "#", year: String(new Date().getFullYear()) }; return h.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => S[k] ?? ""); };

/* ---------- Word-style text editing ---------- */
function RichText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.innerHTML = cleanRaw(value); }, []); // eslint-disable-line  (set once; the editor owns the content afterwards)
  const cmd = (c: string, arg?: string) => { ref.current?.focus(); document.execCommand(c, false, arg); onChange(ref.current?.innerHTML || ""); };
  const T = ({ c, label, title, arg }: { c: string; label: React.ReactNode; title: string; arg?: string }) => <button type="button" title={title} aria-label={title} onMouseDown={(e) => { e.preventDefault(); cmd(c, arg); }} className="grid h-8 min-w-8 place-items-center rounded px-1.5 text-sm text-fg2 hover:bg-raised hover:text-fg">{label}</button>;
  return (
    <div className="rounded-[var(--r-md)] border border-line bg-bg/60">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line p-1.5">
        <T c="bold" label={<b>B</b>} title="Bold" /><T c="italic" label={<i>I</i>} title="Italic" /><T c="underline" label={<u>U</u>} title="Underline" />
        <span className="mx-1 h-5 w-px bg-line" />
        <T c="insertUnorderedList" label="• List" title="Bullet list" /><T c="insertOrderedList" label="1. List" title="Numbered list" />
        <button type="button" title="Add link" onMouseDown={(e) => { e.preventDefault(); const u = prompt("Link address (for example /contact or https://…)"); if (u) cmd("createLink", u.startsWith("/") ? "{{siteUrl}}" + u : u); }} className="h-8 rounded px-2 text-sm text-fg2 hover:bg-raised hover:text-fg">Link</button>
        <T c="removeFormat" label="Clear" title="Clear formatting" />
        <span className="mx-1 h-5 w-px bg-line" />
        <select aria-label="Insert a personal field" className="rounded border border-line bg-bg px-1.5 py-1 text-xs" value="" onMouseDown={() => ref.current?.focus()} onChange={(e) => { if (e.target.value) { ref.current?.focus(); document.execCommand("insertText", false, `{{${e.target.value}}}`); onChange(ref.current?.innerHTML || ""); } }}>
          <option value="">Insert field…</option>{VARS.map((v) => <option key={v} value={v}>{`{{${v}}}`}</option>)}
        </select>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning spellCheck onInput={() => onChange(ref.current?.innerHTML || "")} className="min-h-[120px] px-3.5 py-3 text-[0.95rem] leading-relaxed text-fg outline-none [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5" />
    </div>
  );
}
const cleanRaw = (h: string) => String(h || "").replace(/<script[\s\S]*?<\/script>/gi, "");

/* ---------- Cards: pick real services, packages and posts ---------- */
const SRC: Record<string, { label: string; collection?: string }> = { services: { label: "services", collection: "services" }, packages: { label: "packages and pricing", collection: "packages" }, posts: { label: "blog posts", collection: "posts" }, custom: { label: "custom cards" } };
function toCard(source: string, e: any): CardItem {
  const d = e.data || {};
  if (source === "packages") { const price = d.price ? formatPrice(d.price, d.currency || "USD") + (d.priceMax ? " to " + formatPrice(d.priceMax, d.currency || "USD") : "") + (d.billing && d.billing !== "one-time" ? ` / ${d.billing === "monthly" ? "month" : "year"}` : "") : ""; return { title: e.title, text: d.summary || "", price, href: "/pricing", cta: "See pricing" }; }
  if (source === "posts") return { title: e.title, text: d.excerpt || "", image: mediaUrl(d.cover) || "", href: `/blog/${e.slug}`, cta: "Read more" };
  return { title: e.title, text: d.summary || "", image: mediaUrl(d.cover || d.media) || "", href: `/services/${e.slug}`, cta: "Learn more" };
}
function CardsEditor({ b, set }: { b: Extract<EBlock, { type: "cards" }>; set: (p: Partial<EBlock>) => void }) {
  const [open, setOpen] = useState(false); const [list, setList] = useState<any[] | null>(null); const [sel, setSel] = useState<number[]>([]); const [pickImg, setPickImg] = useState<number | null>(null);
  const col = SRC[b.source].collection;
  useEffect(() => { if (!open || !col) return; setList(null); setSel([]); apiFetch(`/api/admin/entries?collection=${col}&status=published`).then((r) => setList(r.items)).catch((e) => { toast(e.message, "error"); setList([]); }); }, [open, col]);
  const upd = (i: number, p: Partial<CardItem>) => set({ items: b.items.map((x, j) => (j === i ? { ...x, ...p } : x)) } as any);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Show</label><select className="input" value={b.source} onChange={(e) => set({ source: e.target.value as any, items: [] } as any)}><option value="services">Services</option><option value="packages">Packages and pricing</option><option value="posts">Blog posts</option><option value="custom">Custom cards</option></select></div>
        <div><label className="label">Columns</label><select className="input" value={b.columns} onChange={(e) => set({ columns: Number(e.target.value) as any } as any)}><option value={1}>1 column</option><option value={2}>2 columns</option><option value={3}>3 columns</option></select></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {col && <button type="button" className="btn btn-primary !py-1.5 text-sm" onClick={() => setOpen(true)}>Add from your {SRC[b.source].label}</button>}
        <button type="button" className="btn btn-ghost !py-1.5 text-sm" onClick={() => set({ items: [...b.items, { title: "Card title", text: "", cta: "Learn more" }] } as any)}>Add a blank card</button>
      </div>
      {b.items.map((it, i) => (
        <div key={i} className="rounded-[var(--r-md)] border border-line bg-bg/40 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>Card {i + 1}</span><button type="button" className="text-danger" onClick={() => set({ items: b.items.filter((_, j) => j !== i) } as any)}>Remove</button></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input !py-1.5 text-sm" placeholder="Title" value={it.title} onChange={(e) => upd(i, { title: e.target.value })} aria-label="Card title" />
            <input className="input !py-1.5 text-sm" placeholder="Price (optional)" value={it.price || ""} onChange={(e) => upd(i, { price: e.target.value })} aria-label="Card price" />
            <textarea className="input !py-1.5 text-sm sm:col-span-2" rows={2} placeholder="Short text" value={it.text} onChange={(e) => upd(i, { text: e.target.value })} aria-label="Card text" />
            <input className="input !py-1.5 font-mono text-xs" placeholder="Link (/contact)" value={it.href || ""} onChange={(e) => upd(i, { href: e.target.value })} aria-label="Card link" />
            <input className="input !py-1.5 text-sm" placeholder="Link text" value={it.cta || ""} onChange={(e) => upd(i, { cta: e.target.value })} aria-label="Link text" />
            <div className="flex items-center gap-2 sm:col-span-2">{it.image ? <img src={it.image} alt="" className="h-12 w-16 rounded object-cover" /> : <span className="grid h-12 w-16 place-items-center rounded border border-dashed border-line text-[0.65rem] text-muted">No image</span>}
              <button type="button" className="text-sm text-accent hover:underline" onClick={() => setPickImg(i)}>{it.image ? "Change image" : "Add image"}</button>{it.image && <button type="button" className="text-sm text-fg2" onClick={() => upd(i, { image: "" })}>Remove</button>}</div>
          </div>
        </div>
      ))}
      <MediaPicker open={pickImg !== null} onClose={() => setPickImg(null)} accept="image" onPick={(m) => { if (pickImg !== null) upd(pickImg, { image: m.url }); }} />
      <Modal open={open} onClose={() => setOpen(false)} title={`Add ${SRC[b.source].label}`}>
        {list === null ? <p className="flex items-center gap-2 text-fg2"><Spinner /> Loading…</p> : !list.length ? <p className="text-fg2">Nothing published yet.</p> : (
          <div className="max-h-[50vh] space-y-1.5 overflow-y-auto">{list.map((e) => <label key={e.id} className="flex items-center gap-3 rounded border border-line p-2.5 text-sm hover:bg-raised/40"><input type="checkbox" checked={sel.includes(e.id)} onChange={(ev) => setSel(ev.target.checked ? [...sel, e.id] : sel.filter((x) => x !== e.id))} /><span>{e.title}</span></label>)}</div>
        )}
        <div className="mt-4 flex gap-2"><button type="button" className="btn btn-primary !py-2 text-sm" disabled={!sel.length} onClick={() => { set({ items: [...b.items, ...list!.filter((e) => sel.includes(e.id)).map((e) => toCard(b.source, e))] } as any); setOpen(false); }}>Add {sel.length || ""} selected</button><button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => setOpen(false)}>Cancel</button></div>
      </Modal>
    </div>
  );
}

const Align = ({ v, on }: { v: string; on: (a: any) => void }) => <select className="input !w-auto !py-1.5 text-sm" value={v} onChange={(e) => on(e.target.value)} aria-label="Alignment"><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select>;

function BlockBody({ b, set }: { b: EBlock; set: (p: Partial<EBlock>) => void }) {
  const [pick, setPick] = useState(false);
  switch (b.type) {
    case "heading": return <div className="flex flex-wrap gap-2"><input className="input flex-1" value={b.text} onChange={(e) => set({ text: e.target.value } as any)} aria-label="Heading" /><select className="input !w-auto" value={b.size} onChange={(e) => set({ size: e.target.value } as any)} aria-label="Size"><option value="s">Small</option><option value="m">Medium</option><option value="l">Large</option></select><Align v={b.align} on={(a) => set({ align: a } as any)} /></div>;
    case "text": return <div className="space-y-2"><RichText value={b.html} onChange={(h) => set({ html: h } as any)} /><Align v={b.align} on={(a) => set({ align: a } as any)} /></div>;
    case "image": return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">{b.src ? <img src={b.src} alt="" className="h-20 w-28 rounded border border-line object-cover" /> : <div className="grid h-20 w-28 place-items-center rounded border border-dashed border-line text-xs text-muted">No image</div>}
          <div className="flex-1 space-y-2"><div className="flex flex-wrap gap-2"><button type="button" className="btn btn-ghost !py-1.5 text-sm" onClick={() => setPick(true)}>Choose from library</button><button type="button" className="btn btn-ghost !py-1.5 text-sm" onClick={() => { const u = prompt("Image address (https://…)"); if (u) set({ src: u } as any); }}>Paste a URL</button></div>
            <div className="flex items-center gap-2"><input className="input !py-1.5 text-sm" placeholder="Alt text" value={b.alt} onChange={(e) => set({ alt: e.target.value } as any)} aria-label="Alt text" /><AltAiButton label="Email image" url={b.src} alt={b.alt} onAlt={(v) => set({ alt: v } as any)} /></div></div></div>
        <div className="flex flex-wrap gap-2"><input className="input flex-1 !py-1.5 font-mono text-xs" placeholder="Link when clicked (optional)" value={b.href || ""} onChange={(e) => set({ href: e.target.value } as any)} aria-label="Image link" />
          <select className="input !w-auto !py-1.5 text-sm" value={b.width} onChange={(e) => set({ width: Number(e.target.value) } as any)} aria-label="Width"><option value={100}>Full width</option><option value={75}>75%</option><option value={50}>50%</option></select><Align v={b.align} on={(a) => set({ align: a } as any)} /></div>
        <MediaPicker open={pick} onClose={() => setPick(false)} accept="image" onPick={(m) => set({ src: m.url, alt: b.alt || m.alt } as any)} />
      </div>);
    case "button": return <div className="flex flex-wrap gap-2"><input className="input !w-44 flex-1" value={b.label} onChange={(e) => set({ label: e.target.value } as any)} aria-label="Button text" placeholder="Button text" /><input className="input flex-[2] font-mono text-sm" list="email-links" value={b.href} onChange={(e) => set({ href: e.target.value } as any)} aria-label="Button link" placeholder="/contact or https://…" /><select className="input !w-auto" value={b.style} onChange={(e) => set({ style: e.target.value } as any)} aria-label="Style"><option value="solid">Solid</option><option value="outline">Outline</option></select><Align v={b.align} on={(a) => set({ align: a } as any)} /></div>;
    case "cards": return <CardsEditor b={b} set={set} />;
    case "spacer": return <div className="flex items-center gap-3"><label className="text-sm text-fg2" htmlFor={`sp-${b.id}`}>Height (px)</label><input id={`sp-${b.id}`} type="number" min={4} max={120} className="input !w-24" value={b.height} onChange={(e) => set({ height: Number(e.target.value) } as any)} /></div>;
    case "divider": return <p className="text-sm text-muted">A thin dividing line.</p>;
    case "html": return <textarea className="input h-40 font-mono text-xs" spellCheck={false} value={b.html} onChange={(e) => set({ html: e.target.value } as any)} aria-label="Custom HTML" />;
  }
}

export function EmailEditor({ value, onChange, brand }: { value: EditorValue; onChange: (v: EditorValue) => void; brand: EmailBrand }) {
  const [tab, setTab] = useState<"design" | "html">(value.blocks || !value.html ? "design" : "html");
  const [view, setView] = useState<"desktop" | "mobile">("desktop"); const [adding, setAdding] = useState(false);
  const doc = value.blocks;
  const push = (d: EmailDoc, pre = value.preheader) => onChange({ ...value, blocks: d, preheader: pre, html: renderEmail(d, brand, pre) });
  const start = () => { if (value.html && !confirm("Start a visual design? The current custom HTML will be replaced.")) return; push({ v: 1, settings: defaultSettings(brand.accent), blocks: [newBlock("heading"), newBlock("text"), newBlock("button")] }); setTab("design"); };
  const setBlock = (id: string, p: Partial<EBlock>) => doc && push({ ...doc, blocks: doc.blocks.map((b) => (b.id === id ? ({ ...b, ...p } as EBlock) : b)) });
  const move = (i: number, d: number) => { if (!doc) return; const n = [...doc.blocks]; [n[i + d], n[i]] = [n[i], n[i + d]]; push({ ...doc, blocks: n }); };
  const add = (t: EBlock["type"]) => { if (doc) push({ ...doc, blocks: [...doc.blocks, newBlock(t)] }); setAdding(false); };
  const html = useMemo(() => sampleFill(value.html), [value.html]);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="em-sub">Subject</label><input id="em-sub" className="input" value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} placeholder="Hi {{firstName}}, a quick offer" /></div>
          <div><label className="label" htmlFor="em-pre">Preview text</label><input id="em-pre" className="input" value={value.preheader} onChange={(e) => (doc ? push(doc, e.target.value) : onChange({ ...value, preheader: e.target.value }))} placeholder="Shown next to the subject in the inbox" /></div>
        </div>
        <div className="flex gap-1 border-b border-line">{([["design", "Design"], ["html", "HTML code"]] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? "border-accent text-fg" : "border-transparent text-fg2"}`}>{l}</button>)}</div>
        <datalist id="email-links">{["/contact", "/services", "/pricing", "/blog", "/work", "{{verifyUrl}}"].map((l) => <option key={l} value={l} />)}</datalist>

        {tab === "design" && (!doc ? (
          <div className="rounded-[var(--r-md)] border border-dashed border-line p-6 text-center"><p className="text-fg2">{value.html ? "This email is custom HTML, so it is edited in the HTML code tab." : "Build the email with blocks: headings, text, images, buttons and cards."}</p><button type="button" className="btn btn-primary mt-4 !py-2 text-sm" onClick={start}>Start a visual design</button></div>
        ) : (
          <div className="space-y-3">
            <details className="rounded-[var(--r-md)] border border-line p-3"><summary className="cursor-pointer text-sm font-medium">Email style (colours, logo, footer)</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {([["accent", "Accent colour"], ["bg", "Page background"], ["card", "Email background"]] as const).map(([k, l]) => <div key={k}><label className="label">{l}</label><div className="flex gap-2"><input type="color" className="h-10 w-12 cursor-pointer rounded border border-line bg-transparent" value={doc.settings[k]} onChange={(e) => push({ ...doc, settings: { ...doc.settings, [k]: e.target.value } })} aria-label={l} /><input className="input font-mono text-xs" value={doc.settings[k]} onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && push({ ...doc, settings: { ...doc.settings, [k]: e.target.value } })} aria-label={`${l} hex`} /></div></div>)}
                <div className="sm:col-span-3"><Toggle label="Show the logo at the top" checked={doc.settings.showLogo} onChange={(v) => push({ ...doc, settings: { ...doc.settings, showLogo: v } })} /></div>
                <div className="sm:col-span-3"><label className="label">Extra footer text (optional)</label><textarea className="input" rows={2} value={doc.settings.footer} onChange={(e) => push({ ...doc, settings: { ...doc.settings, footer: e.target.value } })} /></div>
              </div></details>
            {doc.blocks.map((b, i) => (
              <div key={b.id} className="rounded-[var(--r-md)] border border-line bg-surface/50 p-3">
                <div className="mb-2 flex items-center justify-between"><span className="mono-tag text-muted">{BLOCK_TYPES.find((x) => x.type === b.type)?.label}</span>
                  <span className="flex items-center gap-1 text-fg2"><button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1.5 disabled:opacity-30" aria-label="Move up">↑</button><button type="button" disabled={i === doc.blocks.length - 1} onClick={() => move(i, 1)} className="px-1.5 disabled:opacity-30" aria-label="Move down">↓</button>
                    <button type="button" onClick={() => { const c = { ...b, id: uid() } as EBlock; const n = [...doc.blocks]; n.splice(i + 1, 0, c); push({ ...doc, blocks: n }); }} className="px-1.5 text-xs hover:text-fg">Copy</button>
                    <button type="button" onClick={() => push({ ...doc, blocks: doc.blocks.filter((x) => x.id !== b.id) })} className="px-1.5 text-danger" aria-label="Delete block">✕</button></span></div>
                <BlockBody b={b} set={(p) => setBlock(b.id, p)} />
              </div>
            ))}
            <div className="relative">
              <button type="button" className="btn btn-ghost w-full !py-2.5 text-sm" onClick={() => setAdding(!adding)}>+ Add a block</button>
              {adding && <div className="glass absolute left-0 right-0 top-full z-20 mt-2 grid gap-1.5 !bg-surface p-2 shadow-xl sm:grid-cols-2">{BLOCK_TYPES.map((t) => <button key={t.type} type="button" onClick={() => add(t.type)} className="rounded p-2.5 text-left hover:bg-raised"><span className="block text-sm font-medium text-fg">{t.label}</span><span className="block text-xs text-muted">{t.hint}</span></button>)}</div>}
            </div>
          </div>
        ))}

        {tab === "html" && (
          <div>
            <textarea className="input h-[460px] font-mono text-xs leading-relaxed" spellCheck={false} value={value.html} onChange={(e) => onChange({ ...value, html: e.target.value, blocks: null })} placeholder="Write or paste email HTML here." />
            <p className="mt-2 text-xs text-muted">Editing the code here switches this email to custom HTML (the Design tab will no longer control it). Use inline styles and tables for the best result in Gmail and Outlook. An unsubscribe link is added automatically if you leave it out.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{VARS.map((v) => <button key={v} type="button" onClick={() => onChange({ ...value, html: value.html + `{{${v}}}`, blocks: null })} className="chip hover:!border-accent hover:!text-fg">{`{{${v}}}`}</button>)}</div>
            {doc === null && value.html && <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={start}>Replace with a visual design</button>}
          </div>
        )}
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-2 flex items-center justify-between"><p className="text-sm text-fg2">Live preview (sample name: Alex)</p>
          <div className="flex rounded-full border border-line p-0.5 text-xs">{(["desktop", "mobile"] as const).map((m) => <button key={m} type="button" onClick={() => setView(m)} className={`rounded-full px-3 py-1 capitalize ${view === m ? "bg-accent text-onaccent" : "text-fg2"}`}>{m}</button>)}</div></div>
        <div className="overflow-hidden rounded-[var(--r-lg)] border border-line bg-white">
          {value.html ? <iframe title="Email preview" sandbox="" srcDoc={html} className="mx-auto block h-[640px] border-0 bg-white" style={{ width: view === "mobile" ? 375 : "100%", maxWidth: "100%" }} /> : <div className="grid h-[640px] place-items-center text-sm text-slate-500">Your email appears here</div>}
        </div>
      </div>
    </div>
  );
}
