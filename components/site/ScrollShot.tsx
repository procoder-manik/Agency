"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** A browser frame around a tall full-page screenshot.
 *  mode "hover": the page scrolls slowly by itself while the card is hovered, focused or touched (used on cards).
 *  mode "manual": visitors scroll through the page themselves, with an optional Auto scroll button (used on the project page). */
export function ScrollShot({ src, alt = "", url, direction = "down", accent, aspect = "aspect-[4/3]", speed = 220, chrome = true, eager = false, mode = "hover", className = "" }: {
  src: string; alt?: string; url?: string; direction?: "down" | "up" | string; accent?: string; aspect?: string; speed?: number; chrome?: boolean; eager?: boolean; mode?: "hover" | "manual"; className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null); const img = useRef<HTMLImageElement>(null);
  const [y, setY] = useState(0); const [dur, setDur] = useState(0); const [loaded, setLoaded] = useState(false); const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(0);
  const raf = useRef(0); const up = direction === "up";
  const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxShift = () => { const f = frame.current, i = img.current; return f && i ? Math.max(0, i.offsetHeight - f.offsetHeight) : 0; };

  // ---- hover mode ----
  const start = useCallback(() => { if (mode !== "hover" || reduced()) return; const d = maxShift(); if (!d) return; setDur(d / speed); setY(up ? 0 : -d); }, [mode, speed, up]);
  const stop = useCallback(() => { if (mode !== "hover") return; const d = maxShift(); setDur(Math.min(1.2, d / (speed * 4))); setY(up ? -d : 0); }, [mode, speed, up]);
  const onLoad = () => { setLoaded(true); if (mode === "hover" && up) { setDur(0); setY(-maxShift()); } };
  useEffect(() => { const i = img.current; if (i?.complete && i.naturalHeight) onLoad(); }, [src]); // eslint-disable-line

  // ---- manual mode: Auto scroll ----
  const stopAuto = useCallback(() => { cancelAnimationFrame(raf.current); setPlaying(false); }, []);
  const toggleAuto = () => {
    const el = frame.current; if (!el) return;
    if (playing) return stopAuto();
    setPlaying(true); let last = performance.now();
    const step = (t: number) => {
      const dt = (t - last) / 1000; last = t; el.scrollTop += speed * dt;
      if (el.scrollTop >= el.scrollHeight - el.clientHeight - 1) { stopAuto(); return; }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const onScroll = () => { const el = frame.current; if (!el) return; const max = el.scrollHeight - el.clientHeight; setProgress(max > 0 ? el.scrollTop / max : 0); };

  let host = ""; try { host = url ? new URL(url).hostname.replace(/^www\./, "") : ""; } catch {}
  const dot = accent || "rgb(var(--c-accent))";
  return (
    <div className={`overflow-hidden border border-line bg-raised ${className}`} style={{ borderRadius: "var(--r-lg)" }}
      onMouseEnter={mode === "hover" ? start : undefined} onMouseLeave={mode === "hover" ? stop : undefined} onFocus={mode === "hover" ? start : undefined} onBlur={mode === "hover" ? stop : undefined} onTouchStart={mode === "hover" ? start : undefined}>
      {chrome && (
        <div className="flex items-center gap-3 border-b border-line bg-surface px-3.5 py-2.5">
          <div className="flex gap-1.5" aria-hidden><span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" /></div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-raised px-3 py-1 text-xs text-muted"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} /><span className="truncate">{host || "preview"}</span></div>
          {mode === "manual" && src && !failed && <button type="button" onClick={toggleAuto} className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-fg2 transition-colors hover:border-accent hover:text-fg" aria-pressed={playing}>{playing ? "Pause" : "Auto scroll"}</button>}
        </div>
      )}
      <div ref={frame} onScroll={mode === "manual" ? onScroll : undefined} onWheel={mode === "manual" ? stopAuto : undefined} onTouchStart={mode === "manual" ? stopAuto : undefined}
        data-lenis-prevent={mode === "manual" ? "" : undefined}
        className={`relative bg-raised ${mode === "manual" ? "h-[min(78vh,780px)] overflow-y-auto overscroll-contain" : `overflow-hidden ${aspect}`}`} tabIndex={mode === "manual" ? 0 : undefined} aria-label={mode === "manual" ? "Scrollable page preview" : undefined}>
        {!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-raised to-surface" />}
        {(!src || failed) && <div className="poster absolute inset-0"><div className="poster-grid" /></div>}
        {src && !failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={img} src={src} alt={alt} onLoad={onLoad} onError={() => setFailed(true)} loading={eager ? "eager" : "lazy"} decoding="async"
            className={mode === "manual" ? `block w-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}` : `absolute left-0 top-0 w-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={mode === "hover" ? { transform: `translate3d(0, ${y}px, 0)`, transition: `transform ${dur}s ${dur > 2 ? "linear" : "cubic-bezier(.16,1,.3,1)"}, opacity .5s` } : undefined} />
        )}
      </div>
      {mode === "manual" && <div className="h-0.5 bg-line"><div className="h-full" style={{ width: `${progress * 100}%`, background: dot }} /></div>}
    </div>
  );
}
