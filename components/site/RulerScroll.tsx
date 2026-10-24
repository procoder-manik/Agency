"use client";
import { useEffect, useRef, useState } from "react";

const CM = 37.7953; // CSS pixels in one centimetre
const MARGIN = 14;
/** A measuring-ruler scroll indicator. The millimetre and centimetre marks slide as you scroll, a marker reads how many centimetres
 *  down the page you are, and a percentage shows progress. Drag along the strip to scrub through the page. The browser bar is hidden. */
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
    const wake = () => { setActive(true); clearTimeout(hideT.current); hideT.current = setTimeout(() => setActive(false), 1400); };
    const onScroll = () => { tick(); wake(); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", tick);
    const ro = new ResizeObserver(tick); ro.observe(document.body);
    const t = setInterval(measure, 1500);
    return () => { root.classList.remove("comet-scroll"); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", tick); ro.disconnect(); clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  if (!g.show) return null;
  const { y, vh, dh } = g;
  const max = Math.max(1, dh - vh), pct = Math.round(Math.min(1, y / max) * 100);
  const markY = vh * 0.34;                          // the reading line, as a share of the screen height
  const atMarker = (y + markY) / CM;                // centimetres from the top of the page at the marker
  const first = Math.floor(y / (5 * CM)), last = Math.ceil((y + vh) / (5 * CM));
  const labels: number[] = []; for (let k = first; k <= last; k++) if (k >= 0) labels.push(k);

  const scrub = (e: React.PointerEvent) => { const r = Math.min(1, Math.max(0, (e.clientY - MARGIN) / Math.max(1, vh - MARGIN * 2))); window.scrollTo(0, r * max); };
  return (
    <div aria-hidden className="fixed bottom-0 right-0 top-0 z-[60] hidden w-10 select-none md:block" style={{ opacity: active || dragging.current ? 1 : 0.8, transition: "opacity .35s ease" }}
      onPointerDown={(e) => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); scrub(e); setActive(true); }}
      onPointerMove={(e) => dragging.current && scrub(e)} onPointerUp={() => { dragging.current = false; setActive(false); }} onPointerCancel={() => { dragging.current = false; }}>
      <div className="absolute inset-0 cursor-ns-resize border-l border-line/60 bg-bg/55 backdrop-blur-md" />
      {/* the moving scale: 1 mm, 5 mm and 1 cm marks */}
      <div className="pointer-events-none absolute right-0 top-0 w-full overflow-hidden" style={{ height: vh }}>
        <div className="absolute right-0 top-0" style={{ width: 40, height: vh + CM * 2, transform: `translate3d(0, ${-(y % CM)}px, 0)`, willChange: "transform",
          backgroundImage: [
            `repeating-linear-gradient(180deg, rgb(var(--c-fg) / .30) 0 1px, transparent 1px ${CM / 10}px)`,
            `repeating-linear-gradient(180deg, rgb(var(--c-fg) / .55) 0 1px, transparent 1px ${CM / 2}px)`,
            `repeating-linear-gradient(180deg, rgb(var(--c-accent)) 0 1.5px, transparent 1.5px ${CM}px)`].join(", "),
          backgroundSize: "8px 100%, 14px 100%, 22px 100%", backgroundPosition: "right top", backgroundRepeat: "no-repeat" }} />
        {labels.map((k) => { const top = k * 5 * CM - y; return top < -12 || top > vh + 12 ? null : <span key={k} className="absolute right-6 font-mono text-[9px] leading-none text-fg2" style={{ transform: `translateY(${top + 4}px)` }}>{k * 5}</span>; })}
      </div>
      {/* reading marker */}
      <div className="pointer-events-none absolute right-0 flex items-center" style={{ top: markY - 9, transform: "translateX(0)" }}>
        <span className="mr-1 rounded-full bg-accent px-2 py-[3px] font-mono text-[10px] font-semibold leading-none text-onaccent shadow-[0_0_14px_rgb(var(--c-accent)/.55)]">{atMarker.toFixed(1)} cm</span>
        <span className="h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent" style={{ borderLeftColor: "rgb(var(--c-accent))" }} />
        <span className="h-px w-9" style={{ background: "linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))", boxShadow: "0 0 8px rgb(var(--c-accent) / .8)" }} />
      </div>
      <div className="pointer-events-none absolute bottom-3 right-1.5 font-mono text-[10px] font-semibold text-fg2">{pct}%</div>
    </div>
  );
}
