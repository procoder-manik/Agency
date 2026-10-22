"use client";
import { useState } from "react";
import { BLOCKS, getBlockDef, newBlock, type Block } from "@/lib/blocks";
import { FieldInput } from "./FieldInput";
import { apiFetch, Modal, Spinner, toast } from "./ui";
import { useAdmin } from "./context";

export function BlocksEditor({ blocks, onChange, pageTitle, builtin }: { blocks: Block[]; onChange: (b: Block[]) => void; pageTitle: string; builtin: boolean }) {
  const [open, setOpen] = useState<string | null>(blocks[0]?.id ?? null);
  const [adding, setAdding] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { aiOn } = useAdmin();
  const set = (i: number, b: Block) => onChange(blocks.map((x, j) => (j === i ? b : x)));
  const move = (i: number, d: number) => { const n = [...blocks]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
  const insert = (at: number, type: string) => { const b = newBlock(type); const n = [...blocks]; n.splice(at, 0, b); onChange(n); setOpen(b.id); setAdding(null); };
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
                  {def.fields.map((f) => <div key={f.name} className={["textarea", "markdown", "list", "media", "image", "tags"].includes(f.type) ? "sm:col-span-2" : ""}><FieldInput field={f} value={b.data[f.name]} onChange={(v) => set(i, { ...b, data: { ...b.data, [f.name]: v } })} /></div>)}
                </div>
              )}
            </div>
            <div className="flex justify-center py-1"><button type="button" onClick={() => setAdding(i + 1)} className="rounded-full px-3 py-0.5 text-xs text-muted hover:bg-raised hover:text-accent">+ Add section here</button></div>
          </div>
        );
      })}
      {blocks.length === 0 && <button type="button" className="btn btn-primary" onClick={() => setAdding(0)}>Add section</button>}
      <Modal open={adding !== null} onClose={() => setAdding(null)} title="Add a section" wide>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map((d) => <button key={d.type} type="button" onClick={() => insert(adding!, d.type)} className="rounded border border-line p-4 text-left transition-colors hover:border-accent"><p className="font-medium">{d.label}</p><p className="mt-1 text-sm text-fg2">{d.description}</p></button>)}
        </div>
      </Modal>
    </div>
  );
}
