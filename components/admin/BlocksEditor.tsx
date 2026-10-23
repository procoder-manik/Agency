"use client";
import { useState } from "react";
import { BLOCKS, getBlockDef, newBlock, type Block } from "@/lib/blocks";
import { HTML_STARTERS, SECTION_PRESETS } from "@/lib/templates";
import { ModuleFields } from "./ModuleTools";
import { FieldInput } from "./FieldInput";
import { apiFetch, Modal, Spinner, toast } from "./ui";
import { useAdmin } from "./context";

export function BlocksEditor({ blocks, onChange, pageTitle, builtin }: { blocks: Block[]; onChange: (b: Block[]) => void; pageTitle: string; builtin: boolean }) {
  const [open, setOpen] = useState<string | null>(blocks[0]?.id ?? null);
  const [adding, setAdding] = useState<number | null>(null);
  const [addTab, setAddTab] = useState<"types" | "ready">("types");
  const [busy, setBusy] = useState<string | null>(null);
  const { aiOn, role } = useAdmin();
  const set = (i: number, b: Block) => onChange(blocks.map((x, j) => (j === i ? b : x)));
  const move = (i: number, d: number) => { const n = [...blocks]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
  const insert = (at: number, type: string, data: Record<string, any> = {}) => { const b = newBlock(type, structuredClone(data)); const n = [...blocks]; n.splice(at, 0, b); onChange(n); setOpen(b.id); setAdding(null); };
  async function aiSection(i: number) {
    const b = blocks[i]; setBusy(b.id);
    try {
      const neighbours = [blocks[i - 1], blocks[i + 1]].filter(Boolean).map((x) => ({ type: x!.type, heading: x!.data.heading }));
      const r = await apiFetch("/api/admin/ai", { method: "POST", json: { task: "section", type: b.type, data: b.data, pageTitle, neighbours } });
      set(i, { ...b, data: { ...b.data, ...r.data.data } }); toast("Section written. Review, then save.");
    } catch (e: any) { toast(e.message, "error"); }
    setBusy(null);
  }
  return (
    <div className="space-y-3">
      {blocks.length === 0 && <p className="rounded border border-dashed border-line p-8 text-center text-fg2">This page has no sections yet. Add the first one below.</p>}
      {blocks.map((b, i) => {
        const def = getBlockDef(b.type); const isOpen = open === b.id;
        return (
          <div key={b.id}>
            <div className={`glass overflow-hidden ${b.hidden ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <button type="button" onClick={() => setOpen(isOpen ? null : b.id)} className="flex flex-1 items-center gap-3 text-left" aria-expanded={isOpen}>
                  <span className="grid h-7 w-7 place-items-center rounded bg-raised font-mono text-xs text-fg2">{i + 1}</span>
                  <span><span className="font-medium">{def?.label || b.type}</span>{b.data.heading && <span className="ml-2 text-sm text-fg2">{b.data.heading}</span>}{b.required && <span className="ml-2 chip !py-0 text-[0.7rem]">Required part</span>}{b.hidden && <span className="ml-2 chip !py-0 text-[0.7rem]">Hidden</span>}</span>
                </button>
                <div className="flex items-center gap-1 text-sm">
                  <button type="button" title="Write this section with AI" disabled={!aiOn || busy === b.id} onClick={() => aiSection(i)} className="rounded px-2 py-1 text-fg2 hover:text-accent disabled:opacity-30">{busy === b.id ? <Spinner /> : "✦"}</button>
                  <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded px-2 py-1 text-fg2 hover:text-fg disabled:opacity-30">↑</button>
                  <button type="button" aria-label="Move down" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} className="rounded px-2 py-1 text-fg2 hover:text-fg disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => set(i, { ...b, hidden: !b.hidden })} className="rounded px-2 py-1 text-fg2 hover:text-fg">{b.hidden ? "Show" : "Hide"}</button>
                  {!(builtin && b.required) && <button type="button" onClick={() => { if (confirm("Delete this section?")) onChange(blocks.filter((_, j) => j !== i)); }} className="rounded px-2 py-1 text-danger">Delete</button>}
                </div>
              </div>
              {isOpen && def && (
                <div className="grid gap-5 border-t border-line p-4 sm:grid-cols-2">
                  {b.type === "module" ? <ModuleFields data={b.data} onChange={(d) => set(i, { ...b, data: d })} />
                    : b.type === "html" && role !== "admin" ? <p className="rounded border border-warning/40 p-4 text-sm text-fg2 sm:col-span-2">Custom HTML can only be edited by an admin. You can still move, hide or delete this section.</p>
                    : <>
                      {b.type === "html" && (
                        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-fg2" htmlFor={`st-${b.id}`}>Start from a template</label>
                          <select id={`st-${b.id}`} className="input max-w-sm" value="" onChange={(e) => { const t = HTML_STARTERS.find((x) => x.id === e.target.value); if (t && (!b.data.html || confirm("Replace the current HTML and CSS with this template?"))) set(i, { ...b, data: { ...b.data, html: t.html, css: t.css } }); }}>
                            <option value="">Choose a starter…</option>{HTML_STARTERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
                      )}
                      {def.fields.map((f) => <div key={f.name} className={["textarea", "markdown", "list", "media", "image", "tags"].includes(f.type) ? "sm:col-span-2" : ""}><FieldInput field={f} value={b.data[f.name]} onChange={(v) => set(i, { ...b, data: { ...b.data, [f.name]: v } })} /></div>)}
                    </>}
                </div>
              )}
            </div>
            <div className="flex justify-center py-1"><button type="button" onClick={() => setAdding(i + 1)} className="rounded-full px-3 py-0.5 text-xs text-muted hover:bg-raised hover:text-accent">+ Add section here</button></div>
          </div>
        );
      })}
      {blocks.length === 0 && <button type="button" className="btn btn-primary" onClick={() => setAdding(0)}>Add section</button>}
      <Modal open={adding !== null} onClose={() => setAdding(null)} title="Add a section" wide>
        <div role="tablist" className="mb-5 flex gap-1 border-b border-line">{([["types", "Section types"], ["ready", "Ready-made sections"]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={addTab === k} onClick={() => setAddTab(k)} className={`border-b-2 px-4 py-2 text-sm font-medium ${addTab === k ? "border-accent text-fg" : "border-transparent text-fg2"}`}>{l}</button>)}</div>
        {addTab === "types" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BLOCKS.filter((d) => d.type !== "html" || role === "admin").map((d) => <button key={d.type} type="button" onClick={() => insert(adding!, d.type)} className="rounded border border-line p-4 text-left transition-colors hover:border-accent"><p className="font-medium">{d.label}</p><p className="mt-1 text-sm text-fg2">{d.description}</p></button>)}
          </div>
        ) : (
          <div className="space-y-6">{Array.from(new Set(SECTION_PRESETS.map((p) => p.category))).map((cat) => (
            <div key={cat}><p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{cat}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{SECTION_PRESETS.filter((p) => p.category === cat && (p.type !== "html" || role === "admin")).map((p) => <button key={p.id} type="button" onClick={() => insert(adding!, p.type, p.data)} className="rounded border border-line p-4 text-left transition-colors hover:border-accent"><p className="font-medium">{p.label}</p><p className="mt-1 text-sm text-fg2">{getBlockDef(p.type)?.label}, filled with example text you can edit.</p></button>)}</div></div>
          ))}</div>
        )}
      </Modal>
    </div>
  );
}
