"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACCENTS } from "@/lib/themes";

export type Pref = "system" | "light" | "dark";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const resolve = (p: Pref): "dark" | "light" => (p === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : p);

function commit(p: Pref) {
  const d = document.documentElement; const m = resolve(p);
  d.dataset.pref = p; d.dataset.mode = m; d.classList.toggle("dark", m === "dark");
  try { localStorage.setItem("mode", p); } catch {}
  window.dispatchEvent(new Event("modechange"));
}

/** Change the mode with a circular reveal from the click position (View Transitions API), instant fallback. */
export function setPref(p: Pref, at?: { x: number; y: number }) {
  const d = document.documentElement;
  const vt = (document as any).startViewTransition;
  if (!vt || reduced() || resolve(p) === d.dataset.mode) return commit(p);
  const x = at?.x ?? innerWidth / 2, y = at?.y ?? 0;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = vt.call(document, () => commit(p));
  t.ready.then(() => d.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 750, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" })).catch(() => {});
}

export function setAccent(id: string) {
  const d = document.documentElement;
  if (id) d.dataset.accent = id; else delete d.dataset.accent;
  try { id ? localStorage.setItem("accent", id) : localStorage.removeItem("accent"); } catch {}
  window.dispatchEvent(new Event("modechange"));
}

export function useThemePref() {
  const [pref, setP] = useState<Pref>("system"); const [mode, setM] = useState<"dark" | "light">("dark"); const [accent, setA] = useState("");
  const sync = useCallback(() => { const d = document.documentElement; setP((d.dataset.pref as Pref) || "system"); setM((d.dataset.mode as any) || "dark"); setA(d.dataset.accent || ""); }, []);
  useEffect(() => {
    sync();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => { if (document.documentElement.dataset.pref === "system") commit("system"); };
    mq.addEventListener("change", onSys); window.addEventListener("modechange", sync);
    return () => { mq.removeEventListener("change", onSys); window.removeEventListener("modechange", sync); };
  }, [sync]);
  return { pref, mode, accent };
}

const Sun = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const Moon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" /></svg>;
const Monitor = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
const OPTIONS: [Pref, string, () => JSX.Element][] = [["system", "System", Monitor], ["light", "Light", Sun], ["dark", "Dark", Moon]];

/** Three-way mode selector: System (follows the device), Light, Dark. */
export function ModeSegment({ className = "" }: { className?: string }) {
  const { pref, mode } = useThemePref();
  return (
    <div>
      <div role="radiogroup" aria-label="Colour mode" className={`grid grid-cols-3 gap-1 rounded-full border border-line bg-bg/50 p-1 ${className}`}>
        {OPTIONS.map(([id, label, Icon]) => (
          <button key={id} type="button" role="radio" aria-checked={pref === id} onClick={(e) => setPref(id, { x: e.clientX, y: e.clientY })}
            className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm font-medium transition-all duration-300 ${pref === id ? "bg-accent text-onaccent shadow-lg" : "text-fg2 hover:text-fg"}`}>
            <Icon />{label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">{pref === "system" ? `Following your device, currently ${mode}.` : `Always ${pref}.`}</p>
    </div>
  );
}

export function ThemePanel({ showMode, showAccent, themeAccent }: { showMode: boolean; showAccent: boolean; themeAccent: { a: string; b: string } }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const { accent } = useThemePref();
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  if (!showMode && !showAccent) return null;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="dialog" aria-label="Appearance: mode and colours" title="Appearance"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/40 text-fg backdrop-blur transition-all duration-300 hover:border-accent hover:text-accent">
        <span className="theme-icon transition-transform duration-500" style={{ transform: open ? "rotate(180deg)" : "none" }}><span className="ti-moon"><Moon /></span><span className="ti-sun"><Sun /></span></span>
        <span aria-hidden className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-bg" style={{ background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }} />
      </button>
      {open && (
        <div role="dialog" aria-label="Appearance" className="fade-in absolute right-0 top-[calc(100%+14px)] z-[70] w-[min(330px,calc(100vw-32px))] rounded-[var(--r-lg)] border border-line bg-surface/95 p-5 shadow-2xl backdrop-blur-2xl">
          {showMode && <><p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Mode</p><ModeSegment /></>}
          {showAccent && (
            <div className={showMode ? "mt-6" : ""}>
              <div className="mb-3 flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wider text-muted">Accent colour</p>{accent && <button type="button" className="text-xs text-accent hover:underline" onClick={() => setAccent("")}>Reset</button>}</div>
              <div className="grid grid-cols-5 gap-2.5" role="group" aria-label="Accent colour">
                <Swatch label="Theme default" a={themeAccent.a} b={themeAccent.b} on={!accent} onClick={() => setAccent("")} />
                {ACCENTS.map((c) => <Swatch key={c.id} label={c.label} a={c.a} b={c.b} on={accent === c.id} onClick={() => setAccent(c.id)} />)}
              </div>
              <p className="mt-3 text-xs text-muted">{accent ? ACCENTS.find((c) => c.id === accent)?.label : "Theme default"}. Contrast is adjusted automatically for each mode.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Swatch({ label, a, b, on, onClick }: { label: string; a: string; b: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={on} title={label}
      className={`relative h-11 w-11 rounded-full transition-all duration-300 hover:scale-110 ${on ? "ring-2 ring-fg ring-offset-2 ring-offset-surface" : ""}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {on && <span className="absolute inset-0 grid place-items-center text-sm font-bold text-white mix-blend-difference" aria-hidden>✓</span>}
    </button>
  );
}
