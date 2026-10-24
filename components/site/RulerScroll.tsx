"use client";
import { useEffect, useRef, useState } from "react";

const CM = 37.7953; // CSS pixels in one centimetre
const MARGIN = 16, W = 26;
/** A slim measuring-ruler scroll indicator with no background. The 1 mm, 5 mm and 1 cm marks slide as you scroll.
 *  The marker is a handle: it travels along the ruler as you scroll, reads the distance in centimetres, and can be dragged up and down. */
export function RulerScroll() {
  const [g, setG] = useState({ show: false, y: 0, vh: 0, dh: 0 });
  const [active, setActive] = useState(false);
  const dragging = useRef(false); const hideT = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return; // touch devices keep their own scrollbar
    const root = document.documentElement; root.classList.add("comet-scroll");
    let raf = 0;
    const measure = () => {
      const vh = window.innerHeight, dh = Math.max(root.scrollHeight, document.body.scrollHeight);
      setG((p) => { const next = { show: dh > vh + 4, y: window.scrollY, vh, dh }; return p.show === next.show && p.y === next.y && p.vh === vh && p.dh === dh ? p : next; });
    };
    const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    const wake = () => { setActive(true); clearTimeout(hideT.current); hideT.current = setTimeout(() => !dragging.current && setActive(false), 1400); };
    const onScroll = () => { tick(); wake(); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", tick);
    const ro = new ResizeObserver(tick); ro.observe(document.body);
    const t = setInterval(measure, 1500);
    return () => { root.classList.remove("comet-scroll"); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", tick); ro.disconnect(); clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  if (!g.show) return null;
  const { y, vh, dh } = g;
  const max = Math.max(1, dh - vh), track = vh - MARGIN * 2;
  const markY = MARGIN + Math.min(1, y / max) * track;   // the handle sits where you are in the page
  const reading = (y + markY) / CM;                       // centimetres from the top of the page at the handle, the same scale as the marks beside it
  const first = Math.floor(y / (5 * CM)), last = Math.ceil((y + vh) / (5 * CM));
  const labels: number[] = []; for (let k = first; k <= last; k++) if (k >= 0) labels.push(k);

  const goTo = (e: React.PointerEvent) => window.scrollTo(0, Math.min(1, Math.max(0, (e.clientY - MARGIN) / Math.max(1, track))) * max);
  const down = (e: React.PointerEvent) => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); goTo(e); setActive(true); };
  const up = () => { dragging.current = false; setActive(false); };
  return (
    <div aria-hidden className="fixed bottom-0 right-0 top-0 z-[30] hidden select-none md:block" style={{ width: W, opacity: active ? 1 : 0.85, transition: "opacity .35s ease" }}
      onPointerDown={down} onPointerMove={(e) => dragging.current && goTo(e)} onPointerUp={up} onPointerCancel={up}>
      <div className="absolute inset-0 cursor-ns-resize" />
      {/* the moving scale: 1 mm, 5 mm and 1 cm marks (no background, only lines) */}
      <div className="pointer-events-none absolute right-0 top-0 w-full overflow-visible" style={{ height: vh }}>
        <div className="absolute right-0 top-0" style={{ width: W, height: vh + CM * 2, transform: `translate3d(0, ${-(y % CM)}px, 0)`, willChange: "transform",
          backgroundImage: [
            `repeating-linear-gradient(180deg, rgb(var(--c-fg) / .34) 0 1px, transparent 1px ${CM / 10}px)`,
            `repeating-linear-gradient(180deg, rgb(var(--c-fg) / .6) 0 1px, transparent 1px ${CM / 2}px)`,
            `repeating-linear-gradient(180deg, rgb(var(--c-accent)) 0 1.5px, transparent 1.5px ${CM}px)`].join(", "),
          backgroundSize: "5px 100%, 9px 100%, 14px 100%", backgroundPosition: "right top", backgroundRepeat: "no-repeat" }} />
        {labels.map((k) => { const top = k * 5 * CM - y; return top < -12 || top > vh + 12 ? null : <span key={k} className="absolute font-mono text-[9px] leading-none text-fg2" style={{ right: 18, transform: `translateY(${top + 4}px)` }}>{k * 5}</span>; })}
      </div>
      {/* the handle: drag it up and down */}
      <div className="absolute right-0 flex cursor-grab items-center active:cursor-grabbing" style={{ top: markY - 10, transition: dragging.current ? "none" : "top .08s linear" }}>
        <span className="mr-0.5 whitespace-nowrap rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold leading-none text-onaccent shadow-[0_0_14px_rgb(var(--c-accent)/.55)]">{reading.toFixed(1)}&nbsp;cm</span>
        <span className="h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent" style={{ borderLeftColor: "rgb(var(--c-accent))" }} />
        <span className="h-px w-5" style={{ background: "linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))", boxShadow: "0 0 8px rgb(var(--c-accent) / .8)" }} />
      </div>
    </div>
  );
}
