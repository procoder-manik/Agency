"use client";
import { useEffect, useState, type ReactNode } from "react";

export async function apiFetch<T = any>(url: string, opts: RequestInit & { json?: any } = {}): Promise<T> {
  const { json, ...rest } = opts;
  const res = await fetch(url, { ...rest, headers: { ...(json !== undefined ? { "content-type": "application/json" } : {}), ...(rest.headers || {}) }, body: json !== undefined ? JSON.stringify(json) : rest.body });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { window.location.href = "/admin/login"; throw new Error("Signed out."); }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/* ---------- toasts ---------- */
type Toast = { id: number; text: string; kind: "ok" | "error" | "info" };
export function toast(text: string, kind: Toast["kind"] = "ok") { window.dispatchEvent(new CustomEvent("admin-toast", { detail: { text, kind } })); }
export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => {
    const f = (e: any) => { const t = { id: Date.now() + Math.random(), ...e.detail }; setList((l) => [...l, t]); setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), t.kind === "error" ? 7000 : 3500); };
    window.addEventListener("admin-toast", f); return () => window.removeEventListener("admin-toast", f);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2" aria-live="polite">
      {list.map((t) => <div key={t.id} className={`fade-in glass !bg-surface px-4 py-3 text-sm shadow-xl ${t.kind === "error" ? "!border-danger text-danger" : t.kind === "info" ? "text-fg" : "!border-success/60 text-fg"}`}>{t.text}</div>)}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-bg/70 p-4 backdrop-blur-sm sm:p-10" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`glass fade-in w-full !bg-surface ${wide ? "max-w-5xl" : "max-w-xl"}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Close" className="text-fg2 hover:text-fg">✕</button></div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => <button key={t} role="tab" aria-selected={active === t} onClick={() => onChange(t)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${active === t ? "border-accent text-fg" : "border-transparent text-fg2 hover:text-fg"}`}>{t}</button>)}
    </div>
  );
}

export function Toggle({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors ${checked ? "border-accent bg-accent" : "border-line bg-raised"}`}>
        <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-fg transition-all ${checked ? "left-[22px] !bg-onaccent" : "left-0.5"}`} />
      </button>
      <span><span className="text-sm text-fg">{label}</span>{help && <span className="block text-xs text-muted">{help}</span>}</span>
    </label>
  );
}

export const Spinner = () => <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />;

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-fg2">{sub}</p>}</div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="glass p-10 text-center"><p className="text-lg font-medium">{title}</p>{children && <div className="mt-3 text-fg2">{children}</div>}</div>;
}

export const fmt = (d: any) => (d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "");
