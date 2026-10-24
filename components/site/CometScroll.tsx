"use client";
import { useEffect, useRef, useState } from "react";

const MARGIN = 14, W = 12;
/** A custom page scrollbar: a thin glowing comet, narrow at the top and round at the bottom, coloured from the theme.
 *  You can drag it or click the rail. The browser's own bar is hidden while this is active. */
export function CometScroll() {
  const [g, setG] = useState({ show: false, top: 0, h: 90, track: 0 });
  const [active, setActive] = useState(false);
  const drag = useRef<null | { y: number; scroll: number; ratio: number }>(null);
  const hideT = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return; // phones and tablets keep their own overlay scrollbar
    const root = document.documentElement; root.classList.add("comet-scroll");
    let raf = 0;
    const measure = () => {
      const vh = window.innerHeight, dh = Math.max(root.scrollHeight, document.body.scrollHeight), y = window.scrollY;
      if (dh <= vh + 4) return setG((p) => (p.show ? { ...p, show: false } : p));
      const track = vh - MARGIN * 2, h = Math.max(96, Math.min(track, (track * vh) / dh));
      const top = MARGIN + (y / (dh - vh)) * (track - h);
      setG({ show: true, top, h, track });
    };
    const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    const wake = () => { setActive(true); clearTimeout(hideT.current); hideT.current = setTimeout(() => setActive(false), 1100); };
    const onScroll = () => { tick(); wake(); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", tick);
    const ro = new ResizeObserver(tick); ro.observe(document.body);
    const t = setInterval(measure, 1500); // content that loads later changes the page height
    return () => { root.classList.remove("comet-scroll"); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", tick); ro.disconnect(); clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  if (!g.show) return null;
  const h = g.h, r = W / 2, belly = Math.max(r + 2, h - r);
  const path = `M${r} 0 C${r + 0.3} ${h * 0.3} ${W} ${h * 0.55} ${W} ${belly} A${r} ${r} 0 0 1 0 ${belly} C0 ${h * 0.55} ${r - 0.3} ${h * 0.3} ${r} 0 Z`;
  const down = (e: React.PointerEvent) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); const dh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight); drag.current = { y: e.clientY, scroll: window.scrollY, ratio: (dh - window.innerHeight) / Math.max(1, g.track - g.h) }; setActive(true); };
  const move = (e: React.PointerEvent) => { const d = drag.current; if (d) window.scrollTo(0, d.scroll + (e.clientY - d.y) * d.ratio); };
  const up = () => { drag.current = null; setActive(false); };
  const rail = (e: React.MouseEvent) => { if (e.target !== e.currentTarget) return; const dh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight); const y = (e.nativeEvent.offsetY - MARGIN) / g.track; window.scrollTo({ top: Math.max(0, y * dh - window.innerHeight / 2), behavior: "smooth" }); };
  return (
    <div aria-hidden onClick={rail} className="fixed bottom-0 right-0 top-0 z-[60] hidden w-5 md:block" style={{ opacity: active || drag.current ? 1 : 0.55, transition: "opacity .35s ease" }}>
      <div className="pointer-events-none absolute right-[10px] w-px" style={{ top: MARGIN, bottom: MARGIN, background: "linear-gradient(180deg, transparent, rgb(var(--c-line) / .7) 12%, rgb(var(--c-line) / .7) 88%, transparent)" }} />
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} className="absolute right-1 cursor-grab touch-none active:cursor-grabbing" style={{ top: g.top, width: W, height: g.h, filter: "drop-shadow(0 0 5px rgb(var(--c-accent) / .55))" }}>
        <svg width={W} height={g.h} viewBox={`0 0 ${W} ${g.h}`} className="block">
          <defs><linearGradient id="comet-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: "rgb(var(--c-accent2))", stopOpacity: 0.15 }} /><stop offset="0.45" style={{ stopColor: "rgb(var(--c-accent2))" }} /><stop offset="1" style={{ stopColor: "rgb(var(--c-accent))" }} /></linearGradient></defs>
          <path d={path} fill="url(#comet-g)" />
          <ellipse cx={r - 1.2} cy={belly - 1} rx={1.6} ry={2.6} fill="#fff" opacity="0.35" />
        </svg>
      </div>
    </div>
  );
}
