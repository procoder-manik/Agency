"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** A thin themed bar that starts the moment a link is clicked and finishes when the new page arrives,
 *  so every click gives instant feedback while the next page loads. */
export function NavProgress() {
  const path = usePathname();
  const [w, setW] = useState(0); const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(); const safety = useRef<ReturnType<typeof setTimeout>>(); const active = useRef(false);

  const start = () => {
    if (active.current) return; active.current = true;
    clearInterval(timer.current); clearTimeout(safety.current);
    setShow(true); setW(12);
    timer.current = setInterval(() => setW((x) => (x < 85 ? x + (90 - x) * 0.12 : x)), 160);
    safety.current = setTimeout(done, 12000); // never hang if a navigation is cancelled
  };
  const done = () => {
    if (!active.current) return; active.current = false;
    clearInterval(timer.current); clearTimeout(safety.current);
    setW(100); setTimeout(() => { setShow(false); setW(0); }, 260);
  };

  useEffect(() => { done(); }, [path]); // eslint-disable-line
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") || ""; if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      let u: URL; try { u = new URL(a.href, location.href); } catch { return; }
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); clearInterval(timer.current); clearTimeout(safety.current); };
  }, []); // eslint-disable-line
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px]" style={{ opacity: show ? 1 : 0, transition: "opacity .25s ease" }}>
      <div className="h-full rounded-r-full" style={{ width: `${w}%`, transition: w === 0 ? "none" : "width .2s ease-out", background: "linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))", boxShadow: "0 0 12px rgb(var(--c-accent) / .8), 0 0 4px rgb(var(--c-accent2) / .9)" }} />
    </div>
  );
}
