"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Magnetic } from "./fx";
import { ThemePanel } from "./ThemePanel";

export function HeaderShell({ logo, links, cta, themeUi }: { logo: ReactNode; links: { label: string; href: string }[]; cta?: { label: string; href: string }; themeUi: { showMode: boolean; showAccent: boolean; themeAccent: { a: string; b: string } } }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const path = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number; on: boolean }>({ left: 0, width: 0, on: false });
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  useEffect(() => {
    let last = window.scrollY;
    const root = document.documentElement;
    const place = () => { const bar = parseFloat(getComputedStyle(root).getPropertyValue("--bar-h")) || 0; if (headRef.current) headRef.current.style.top = Math.max(0, bar - window.scrollY) + "px"; };
    const f = () => { const y = window.scrollY; setScrolled(y > 20); setHidden(y > 300 && y > last && !open); last = y; place(); };
    f(); window.addEventListener("scroll", f, { passive: true });
    const mo = new MutationObserver(place); mo.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => { window.removeEventListener("scroll", f); mo.disconnect(); };
  }, [open]);
  const active = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));
  const toEl = (el: HTMLElement | null) => { if (!el || !navRef.current) return setPill((p) => ({ ...p, on: false })); const r = el.getBoundingClientRect(); const pr = navRef.current.getBoundingClientRect(); setPill({ left: r.left - pr.left, width: r.width, on: true }); };
  const resetPill = () => toEl(navRef.current?.querySelector<HTMLElement>("[data-active='true']") || null);
  useLayoutEffect(() => { const t = setTimeout(resetPill, 50); return () => clearTimeout(t); }, [path, links.length]); // eslint-disable-line
  return (
    <>
      <header ref={headRef} style={{ top: "var(--bar-h, 0px)" }} className={`fixed inset-x-0 z-50 transition-transform duration-500 ease-out ${hidden ? "-translate-y-full" : ""}`}>
        <div className="container-x pt-3 sm:pt-4">
          <div className={`flex h-[64px] items-center justify-between gap-4 rounded-full px-3 pl-5 transition-all duration-500 ${scrolled || open ? "border border-line/70 bg-bg/70 shadow-[0_10px_40px_-20px_rgb(0_0_0/.35)] backdrop-blur-2xl" : "border border-transparent"}`}>
            <Link href="/" className="relative z-10 shrink-0" aria-label="Home">{logo}</Link>
            <nav aria-label="Main" className="hidden lg:block">
              <div ref={navRef} className="relative flex items-center" onMouseLeave={resetPill}>
                <span aria-hidden className="absolute top-0 h-full rounded-full bg-raised transition-all duration-500 ease-out" style={{ left: pill.left, width: pill.width, opacity: pill.on ? 1 : 0 }} />
                {links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} data-active={active(l.href)} onMouseEnter={(e) => toEl(e.currentTarget)}
                    className={`relative rounded-full px-4 py-2 text-[0.95rem] transition-colors ${active(l.href) ? "text-fg" : "text-fg2 hover:text-fg"}`}>{l.label}</Link>
                ))}
              </div>
            </nav>
            <div className="relative z-10 flex items-center gap-2">
              <ThemePanel {...themeUi} />
              {cta && <Magnetic className="hidden sm:inline-block"><Link href={cta.href} className="btn btn-primary !py-2.5 !text-[0.92rem]">{cta.label}<span className="arrow" aria-hidden>→</span></Link></Magnetic>}
              <button className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/40 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
                <span className="sr-only">Menu</span>
                <span aria-hidden className="relative block h-3 w-5">
                  <span className={`absolute left-0 h-[1.5px] w-5 bg-fg transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                  <span className={`absolute left-0 h-[1.5px] w-5 bg-fg transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div id="mobile-nav" data-lenis-prevent className={`fixed inset-0 z-40 bg-bg transition-[clip-path] duration-700 ease-[cubic-bezier(.77,0,.18,1)] lg:hidden ${open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`} aria-hidden={!open}>
        <nav aria-label="Mobile" className="container-x flex h-full flex-col justify-center gap-1 pt-20">
          {links.map((l, i) => (
            <Link key={l.href + l.label} href={l.href} tabIndex={open ? 0 : -1} className="word py-1"><span className={`font-display text-[clamp(2.4rem,11vw,4rem)] font-bold leading-tight ${active(l.href) ? "text-accent" : "text-fg"}`} style={{ animation: open ? undefined : "none", animationDelay: `${120 + i * 60}ms` }}>{l.label}</span></Link>
          ))}
          {cta && <Link href={cta.href} tabIndex={open ? 0 : -1} className="btn btn-primary mt-8 self-start">{cta.label}</Link>}
        </nav>
      </div>
    </>
  );
}
