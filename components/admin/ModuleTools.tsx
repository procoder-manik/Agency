"use client";
import { useEffect, useRef, useState } from "react";
import type { Field } from "@/lib/fields";
import { renderMustache, scopeCss } from "@/lib/mustache";
import { apiFetch } from "./ui";
import { FieldInput } from "./FieldInput";

export interface ModuleDef { id: number; title: string; status: string; data: { fields?: { name: string; label: string; type: string; subfields?: string }[]; html?: string; css?: string } }
let cache: Promise<ModuleDef[]> | null = null;
export function useModules() {
  const [list, setList] = useState<ModuleDef[]>([]);
  useEffect(() => { cache = cache || apiFetch("/api/admin/entries?collection=modules").then((r: any) => r.items).catch(() => []); cache.then(setList); }, []);
  return list;
}
export const resetModules = () => { cache = null; };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const subType = (n: string): Field["type"] => (/image|photo|logo|picture/i.test(n) ? "image" : /text|description|body|detail/i.test(n) ? "textarea" : "text");
export function toField(f: { name: string; label: string; type: string; subfields?: string }): Field {
  const base = { name: f.name, label: f.label || cap(f.name), ai: false } as Field;
  if (f.type === "list") return { ...base, type: "list", fields: (f.subfields || "title, text").split(",").map((x) => x.trim()).filter(Boolean).map((n) => ({ name: n, label: cap(n), type: subType(n) })) };
  return { ...base, type: (["text", "textarea", "markdown", "url", "image", "number", "toggle", "tags"].includes(f.type) ? f.type : "text") as Field["type"] };
}

/** Renders the fields a custom module defines, inside the page builder. */
export function ModuleFields({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const mods = useModules();
  const mod = mods.find((m) => m.id === Number(data.module));
  const values = data.values || {};
  return (
    <div className="space-y-5 sm:col-span-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-fg2" htmlFor="mod-pick">Module</label>
        <select id="mod-pick" className="input" value={data.module || ""} onChange={(e) => onChange({ ...data, module: e.target.value ? Number(e.target.value) : "", values: {} })}>
          <option value="">Choose a module…</option>{mods.map((m) => <option key={m.id} value={m.id}>{m.title}{m.status !== "published" ? " (draft)" : ""}</option>)}
        </select>
        {!mods.length && <p className="mt-1 text-xs text-muted">No modules yet. Create one under Design &gt; Custom modules.</p>}
        {mod && mod.status !== "published" && <p className="mt-1 text-xs text-warning">This module is a draft, so it will not show on the site until you publish it.</p>}
      </div>
      {mod && (mod.data.fields || []).map((f) => <FieldInput key={f.name} field={toField(f)} value={values[f.name]} onChange={(v) => onChange({ ...data, values: { ...values, [f.name]: v } })} />)}
    </div>
  );
}

function sampleFor(fields: NonNullable<ModuleDef["data"]["fields"]>) {
  const o: Record<string, any> = {};
  for (const f of fields) {
    if (!f.name) continue;
    o[f.name] = f.type === "textarea" ? "Sample text for this field. Replace it with your own." : f.type === "markdown" ? "<p>Sample <strong>formatted</strong> text.</p>" : f.type === "url" ? "#" : f.type === "number" ? "3" : f.type === "toggle" ? "1" : f.type === "tags" ? ["One", "Two", "Three"] : f.type === "image" ? "" : f.type === "list"
      ? [1, 2, 3].map((i) => Object.fromEntries((f.subfields || "title, text").split(",").map((x) => x.trim()).filter(Boolean).map((n) => [n, subType(n) === "image" ? "" : `Item ${i} ${n}`]))) : `Sample ${f.label || f.name}`;
  }
  return o;
}

/** Live preview of a module using the current theme, in an isolated frame. */
export function ModulePreview({ item }: { item: { data: Record<string, any> } }) {
  const ref = useRef<HTMLIFrameElement>(null); const [h, setH] = useState(240); const [mode, setMode] = useState<"dark" | "light">("dark");
  const [doc, setDoc] = useState("");
  useEffect(() => {
    const root = document.documentElement; const m = (root.dataset.mode as any) === "light" ? "light" : "dark"; setMode(m);
    const build = (mm: string) => {
      let html = ""; let css = "";
      try { html = renderMustache(String(item.data.html || ""), sampleFor(item.data.fields || [])).replace(/<script[\s\S]*?<\/script>/gi, ""); css = scopeCss(String(item.data.css || ""), "#preview"); } catch {}
      const tokens = document.getElementById("theme-tokens")?.textContent || "";
      const fonts = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]')).map((l) => `<link rel="stylesheet" href="${(l as HTMLLinkElement).href}">`).join("");
      return `<!doctype html><html data-mode="${mm}" ${root.dataset.accent ? `data-accent="${root.dataset.accent}"` : ""}><head><meta charset="utf-8">${fonts}<style>${tokens}</style><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:rgb(var(--c-bg));color:rgb(var(--c-fg));font-family:var(--font-body);line-height:1.6}h1,h2,h3,h4{font-family:var(--font-display);color:rgb(var(--c-fg));line-height:1.05;letter-spacing:-.02em;margin:0}p{margin:0}a{color:inherit}img{max-width:100%}</style><style>${css}</style></head><body><div id="preview">${html}</div></body></html>`;
    };
    setDoc(build(mode === "light" ? "light" : m));
  }, [item.data.html, item.data.css, item.data.fields, mode]); // eslint-disable-line
  return (
    <div>
      <div className="mb-3 flex items-center justify-between"><p className="text-sm text-fg2">Preview with sample values and the current theme.</p>
        <div className="flex rounded-full border border-line p-0.5 text-sm">{(["dark", "light"] as const).map((m) => <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full px-3 py-1 capitalize ${mode === m ? "bg-accent text-onaccent" : "text-fg2"}`}>{m}</button>)}</div></div>
      <iframe ref={ref} title="Module preview" sandbox="allow-same-origin" srcDoc={doc} className="w-full rounded border border-line bg-bg" style={{ height: h }}
        onLoad={() => { const d = ref.current?.contentDocument; if (d) setH(Math.min(1400, Math.max(160, d.documentElement.scrollHeight + 4))); }} />
    </div>
  );
}
