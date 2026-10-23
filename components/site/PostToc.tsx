"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface TocEntry { id: string; text: string; level: 2 | 3 }
export interface TocCta { title: string; text: string; label: string; href: string }

function useActive(items: TocEntry[]) {
  const [active, setActive] = useState(""); const [progress, setProgress] = useState(0);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[]; if (!els.length) return;
    let raf = 0;
    const tick = () => {
      raf = 0; let cur = "";
      for (const el of els) { if (el.getBoundingClientRect().top <= 150) cur = el.id; else break; }
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = els[els.length - 1].id;
      setActive(cur);
      const body = document.getElementById("post-body");
      if (body) { const r = body.getBoundingClientRect(); setProgress(Math.min(1, Math.max(0, (innerHeight * 0.35 - r.top) / Math.max(1, r.height - innerHeight * 0.2)))); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [items]);
  return { active, progress };
}

function jump(e: React.MouseEvent, id: string) {
  e.preventDefault();
  const el = document.getElementById(id); if (!el) return;
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function List({ items, active }: { items: TocEntry[]; active: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => { const a = ref.current?.querySelector<HTMLElement>('[aria-current="true"]'); const box = ref.current?.parentElement; if (a && box && box.scrollHeight > box.clientHeight) box.scrollTo({ top: a.offsetTop - box.clientHeight / 2, behavior: "smooth" }); }, [active]);
  return (
    <ul ref={ref} className="space-y-0.5">
      {items.map((i) => {
        const on = i.id === active;
        return (
          <li key={i.id}>
            <a href={`#${i.id}`} onClick={(e) => jump(e, i.id)} aria-current={on ? "true" : undefined}
              className={`block border-l-2 py-1.5 pr-2 text-[0.9rem] leading-snug transition-all duration-300 ${i.level === 3 ? "pl-7" : "pl-4"} ${on ? "border-accent font-medium text-fg" : "border-transparent text-fg2 hover:border-line hover:text-fg"}`}>
              {i.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop: sticky table of contents with scroll tracking, reading progress and a call to action. */
export function PostToc({ items, cta }: { items: TocEntry[]; cta: TocCta }) {
  const { active, progress } = useActive(items);
  return (
    <aside className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-28 space-y-6">
        {items.length > 1 && (
          <nav className="glass p-5" aria-label="On this page">
            <div className="mb-4 flex items-center justify-between"><p className="mono-tag text-muted">On this page</p><span className="mono-tag text-accent">{Math.round(progress * 100)}%</span></div>
            <div className="mb-4 h-[3px] overflow-hidden rounded bg-line"><div className="h-full origin-left bg-gradient-to-r from-accent to-accent2" style={{ transform: `scaleX(${progress})` }} /></div>
            <div className="max-h-[42vh] overflow-y-auto overscroll-contain pr-1" data-lenis-prevent><List items={items} active={active} /></div>
          </nav>
        )}
        <CtaCard cta={cta} />
      </div>
    </aside>
  );
}

/** Mobile: collapsible list at the top of the article. */
export function PostTocMobile({ items }: { items: TocEntry[] }) {
  const { active } = useActive(items); const [open, setOpen] = useState(false);
  if (items.length < 2) return null;
  return (
    <details className="glass mb-10 lg:hidden" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-medium [&::-webkit-details-marker]:hidden">On this page<span aria-hidden className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>⌄</span></summary>
      <div className="max-h-[50vh] overflow-y-auto px-4 pb-4" data-lenis-prevent><List items={items} active={active} /></div>
    </details>
  );
}

export function CtaCard({ cta }: { cta: TocCta }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--r-lg)] p-6 text-onaccent" style={{ background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>
      <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <p className="relative font-display text-xl font-bold leading-tight">{cta.title}</p>
      <p className="relative mt-2 text-sm opacity-90">{cta.text}</p>
      <Link href={cta.href} className="btn relative mt-5 w-full !bg-bg !text-fg hover:!shadow-xl">{cta.label}<span className="arrow" aria-hidden>→</span></Link>
    </div>
  );
}
