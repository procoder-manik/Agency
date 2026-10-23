"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Media } from "./motion";

/* ---------- Services as large interactive rows with a cursor-following preview ---------- */
export function ServiceRows({ items }: { items: { id: number; title: string; href: string; summary: string; icon: string; img: string }[] }) {
  const box = useRef<HTMLDivElement>(null); const prev = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: PointerEvent) => { const r = box.current?.getBoundingClientRect(); if (!r) return; x = e.clientX - r.left; y = e.clientY - r.top; };
    const loop = () => { cx += (x - cx) * 0.12; cy += (y - cy) * 0.12; if (prev.current) prev.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${(x - cx) * 0.05}deg)`; raf = requestAnimationFrame(loop); };
    window.addEventListener("pointermove", move, { passive: true }); raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  const cur = items.find((i) => i.id === hover);
  return (
    <div ref={box} className="relative border-t border-line" onPointerLeave={() => setHover(null)}>
      <div ref={prev} aria-hidden className={`pointer-events-none absolute left-0 top-0 z-20 hidden h-56 w-80 overflow-hidden rounded-[var(--r-lg)] shadow-2xl transition-[opacity,scale] duration-500 lg:block ${cur?.img ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
        {items.filter((i) => i.img).map((i) => <div key={i.id} className={`absolute inset-0 transition-opacity duration-500 ${hover === i.id ? "opacity-100" : "opacity-0"}`}><Media src={i.img} alt="" className="h-full w-full" /></div>)}
      </div>
      {items.map((s) => (
        <Link key={s.id} href={s.href} onPointerEnter={() => setHover(s.id)} data-cursor={s.img ? "" : "Explore"}
          className="row-link group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line px-2 py-7 sm:gap-8 sm:px-4 sm:py-9">
          <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full border border-line text-lg text-accent transition-colors sm:h-14 sm:w-14">{s.icon || "◆"}</span>
          <span className="min-w-0">
            <span className="block font-display text-[clamp(1.7rem,4.2vw,3.6rem)] font-bold leading-none tracking-tight text-fg">{s.title}</span>
            {s.summary && <span className="mt-2 block max-w-2xl text-fg2 sm:text-lg">{s.summary}</span>}
          </span>
          <span aria-hidden className="row-arrow grid h-12 w-12 place-items-center rounded-full border border-line text-xl text-fg sm:h-16 sm:w-16">→</span>
        </Link>
      ))}
    </div>
  );
}

/* ---------- Process steps with a scroll-linked progress line ---------- */
export function StepsProgress({ items }: { items: { title: string; text?: string }[] }) {
  const ref = useRef<HTMLOListElement>(null); const [p, setP] = useState(0); const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current; if (el) {
        const r = el.getBoundingClientRect(); const mid = innerHeight * 0.55;
        setP(Math.max(0, Math.min(1, (mid - r.top) / r.height)));
        const lis = Array.from(el.children) as HTMLElement[]; let a = 0; lis.forEach((li, i) => { if (li.getBoundingClientRect().top < mid) a = i; }); setActive(a);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <ol ref={ref} className="relative space-y-14 pl-16 sm:pl-24">
      <span aria-hidden className="absolute left-[22px] top-2 h-[calc(100%-1rem)] w-px bg-line sm:left-[30px]" />
      <span aria-hidden className="absolute left-[22px] top-2 w-px origin-top bg-gradient-to-b from-accent to-accent2 sm:left-[30px]" style={{ height: "calc(100% - 1rem)", transform: `scaleY(${p})` }} />
      {items.map((s, i) => (
        <li key={i} className={`relative transition-opacity duration-500 ${i <= active ? "opacity-100" : "opacity-35"}`}>
          <span aria-hidden className={`absolute -left-16 top-0 grid h-11 w-11 place-items-center rounded-full border font-mono text-sm transition-all duration-500 sm:-left-24 sm:h-[60px] sm:w-[60px] ${i <= active ? "border-accent bg-accent text-onaccent" : "border-line bg-bg text-fg2"}`}>{String(i + 1).padStart(2, "0")}</span>
          <h3 className="h-card">{s.title}</h3>
          {s.text && <p className="mt-3 max-w-xl text-lg text-fg2">{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

/* ---------- Testimonials slider ---------- */
export function TestimonialSlider({ items }: { items: { quote: string; name: string; role: string; photo?: string; alt?: string }[] }) {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false); const n = items.length;
  useEffect(() => { if (n < 2 || paused) return; const t = setTimeout(() => setI((x) => (x + 1) % n), 7000); return () => clearTimeout(t); }, [i, n, paused]);
  const t = items[i];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative">
      <span aria-hidden className="pointer-events-none absolute -left-2 -top-16 select-none font-display text-[12rem] leading-none text-accent/15 sm:-top-24 sm:text-[18rem]">“</span>
      <figure key={i} className="fade-in relative" aria-live="polite">
        <blockquote className="font-display text-[clamp(1.6rem,3.6vw,3.2rem)] font-medium leading-[1.15] tracking-tight text-fg">{t.quote}</blockquote>
        <figcaption className="mt-10 flex items-center gap-4">
          {t.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.photo} alt={t.alt || t.name} className="h-14 w-14 rounded-full object-cover" loading="lazy" />}
          <div><p className="font-semibold text-fg">{t.name}</p><p className="text-fg2">{t.role}</p></div>
        </figcaption>
      </figure>
      {n > 1 && (
        <div className="mt-12 flex items-center gap-6">
          <div className="flex gap-2">
            <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">←</button>
            <button onClick={() => setI((i + 1) % n)} aria-label="Next testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent">→</button>
          </div>
          <div className="flex flex-1 gap-2">{items.map((_, j) => (
            <button key={j} onClick={() => setI(j)} aria-label={`Testimonial ${j + 1}`} className="relative h-[3px] flex-1 overflow-hidden rounded bg-line">
              <span className="absolute inset-0 origin-left bg-accent" style={{ transform: `scaleX(${j < i ? 1 : 0})`, ...(j === i ? { animation: paused ? "none" : "introbar 7s linear forwards", transform: paused ? "scaleX(.5)" : undefined } : {}) }} />
            </button>
          ))}</div>
          <span className="font-mono text-sm text-fg2">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
        </div>
      )}
    </div>
  );
}
