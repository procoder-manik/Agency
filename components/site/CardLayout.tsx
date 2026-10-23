"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const SLIDE: Record<number, string> = {
  2: "w-[86%] sm:w-[calc((100%-1rem)/2)]",
  3: "w-[86%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]",
  4: "w-[86%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]",
};

/** One card list, two layouts: a normal grid, or a swipeable carousel with optional auto scroll (on by default). */
export function CardLayout({ items, layout = "grid", auto = true, gridClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", perView = 3 }: { items: ReactNode[]; layout?: string; auto?: boolean; gridClass?: string; perView?: 2 | 3 | 4 }) {
  if (layout !== "carousel") return <div className={gridClass}>{items.map((n, i) => <div key={i} className="contents">{n}</div>)}</div>;
  return <Carousel items={items} auto={auto} perView={perView} />;
}

function Carousel({ items, auto, perView }: { items: ReactNode[]; auto: boolean; perView: 2 | 3 | 4 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(auto); const [hover, setHover] = useState(false); const [visible, setVisible] = useState(true);
  const [overflow, setOverflow] = useState(false); const [idx, setIdx] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const step = () => { const el = ref.current; const first = el?.firstElementChild as HTMLElement | null; return (first?.getBoundingClientRect().width || 300) + 16; };
  const go = useCallback((dir: number) => {
    const el = ref.current; if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * step(), behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setOverflow(el.scrollWidth > el.clientWidth + 8);
    const onScroll = () => setIdx(Math.round(el.scrollLeft / step()));
    measure(); const ro = new ResizeObserver(measure); ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 }); io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); el.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    if (!auto || !playing || hover || !visible || !overflow || reduced) return;
    const t = setInterval(() => go(1), 3800);
    return () => clearInterval(t);
  }, [auto, playing, hover, visible, overflow, reduced, go]);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocusCapture={() => setHover(true)} onBlurCapture={() => setHover(false)} onTouchStart={() => setHover(true)} onTouchEnd={() => setTimeout(() => setHover(false), 2500)}>
      <div ref={ref} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2" tabIndex={0} role="region" aria-label="Cards carousel" aria-roledescription="carousel">
        {items.map((n, i) => <div key={i} className={`flex shrink-0 snap-start ${SLIDE[perView]}`}><div className="h-full w-full">{n}</div></div>)}
      </div>
      {overflow && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Previous cards" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">←</button>
            <button type="button" onClick={() => go(1)} aria-label="Next cards" className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">→</button>
            {auto && <button type="button" onClick={() => setPlaying(!playing)} aria-pressed={!playing} aria-label={playing ? "Pause auto scroll" : "Resume auto scroll"} className="grid h-11 w-11 place-items-center rounded-full border border-line text-sm transition-colors hover:border-accent hover:text-accent">{playing ? "❚❚" : "▶"}</button>}
          </div>
          <div className="hidden flex-1 gap-1.5 sm:flex" aria-hidden>
            {items.map((_, i) => <span key={i} className={`h-[3px] flex-1 rounded transition-colors duration-500 ${i === Math.min(idx, items.length - 1) ? "bg-accent" : "bg-line"}`} />)}
          </div>
          <span className="mono-tag text-muted">{String(Math.min(idx, items.length - 1) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        </div>
      )}
    </div>
  );
}
