"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ThemePanel } from "./ThemePanel";
import type { HeaderLink } from "@/lib/menu";

const hasMenu = (l: HeaderLink) => (l.type === "dropdown" || l.type === "mega") && !!l.columns?.length;

export function HeaderShell({ logo, links, cta, themeUi }: { logo: ReactNode; links: HeaderLink[]; cta?: { label: string; href: string }; themeUi: { showMode: boolean; showAccent: boolean; themeAccent: { a: string; b: string } } }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState<{ i: number; left: number; width: number } | null>(null);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const path = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const closeT = useRef<ReturnType<typeof setTimeout>>();
  const [pill, setPill] = useState<{ left: number; width: number; on: boolean }>({ left: 0, width: 0, on: false });
  useEffect(() => { setOpen(false); setMenu(null); setMobileOpen(null); }, [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  useEffect(() => {
    let last = window.scrollY;
    const root = document.documentElement;
    const place = () => { const bar = parseFloat(getComputedStyle(root).getPropertyValue("--bar-h")) || 0; if (headRef.current) headRef.current.style.top = Math.max(0, bar - window.scrollY) + "px"; };
    const f = () => { const y = window.scrollY; setScrolled(y > 20); setHidden(y > 300 && y > last && !open); if (y > last) setMenu(null); last = y; place(); };
    f(); window.addEventListener("scroll", f, { passive: true });
    const mo = new MutationObserver(place); mo.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => { window.removeEventListener("scroll", f); mo.disconnect(); };
  }, [open]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const isOn = (h: string) => !!h && (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));
  const active = (l: HeaderLink) => isOn(l.href) || !!l.columns?.some((c) => c.links.some((x) => isOn(x.href)));
  const toEl = (el: HTMLElement | null) => { if (!el || !navRef.current) return setPill((p) => ({ ...p, on: false })); const r = el.getBoundingClientRect(); const pr = navRef.current.getBoundingClientRect(); setPill({ left: r.left - pr.left, width: r.width, on: true }); };
  const resetPill = () => toEl(navRef.current?.querySelector<HTMLElement>("[data-active='true']") || null);
  useLayoutEffect(() => { const t = setTimeout(resetPill, 50); return () => clearTimeout(t); }, [path, links.length]); // eslint-disable-line
  const openMenu = (i: number, el: HTMLElement) => {
    clearTimeout(closeT.current);
    const r = el.getBoundingClientRect(); const w = wrapRef.current?.getBoundingClientRect();
    setMenu({ i, left: r.left - (w?.left || 0), width: r.width });
  };
  const closeSoon = () => { clearTimeout(closeT.current); closeT.current = setTimeout(() => setMenu(null), 160); };
  const cur = menu ? links[menu.i] : null;
  return (
    <>
      <header ref={headRef} style={{ top: "var(--bar-h, 0px)" }} className={`fixed inset-x-0 z-50 transition-transform duration-500 ease-out ${hidden ? "-translate-y-full" : ""}`}>
        <div ref={wrapRef} className="container-x relative pt-3 sm:pt-4" onMouseLeave={closeSoon}>
          <div className={`flex h-[64px] items-center justify-between gap-4 rounded-full px-3 pl-5 transition-all duration-500 ${scrolled || open || menu ? "border border-line/70 bg-bg/70 shadow-[0_10px_40px_-20px_rgb(0_0_0/.35)] backdrop-blur-2xl" : "border border-transparent"}`}>
            <Link href="/" className="relative z-10 shrink-0" aria-label="Home">{logo}</Link>
            <nav aria-label="Main" className="hidden lg:block">
              <div ref={navRef} className="relative flex items-center" onMouseLeave={resetPill}>
                <span aria-hidden className="absolute top-0 h-full rounded-full bg-raised transition-all duration-500 ease-out" style={{ left: pill.left, width: pill.width, opacity: pill.on ? 1 : 0 }} />
                {links.map((l, i) => {
                  const cls = `relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.95rem] transition-colors ${active(l) ? "text-fg" : "text-fg2 hover:text-fg"}`;
                  if (!hasMenu(l)) return <Link key={l.href + l.label} href={l.href} data-active={active(l)} onMouseEnter={(e) => { toEl(e.currentTarget); closeSoon(); }} className={cls}>{l.label}</Link>;
                  const on = menu?.i === i;
                  return (
                    <button key={l.label + i} type="button" data-active={active(l)} aria-expanded={on} aria-haspopup="true" onMouseEnter={(e) => { toEl(e.currentTarget); openMenu(i, e.currentTarget); }} onClick={(e) => (on ? setMenu(null) : openMenu(i, e.currentTarget))} className={cls}>
                      {l.label}<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`transition-transform duration-300 ${on ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                  );
                })}
              </div>
            </nav>
            <div className="relative z-10 flex items-center gap-2">
              <ThemePanel {...themeUi} />
              {cta && <Link href={cta.href} className="btn btn-primary hidden !py-2.5 !text-[0.92rem] sm:inline-flex">{cta.label}<span className="arrow" aria-hidden>→</span></Link>}
              <button className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/40 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
                <span className="sr-only">Menu</span>
                <span aria-hidden className="relative block h-3 w-5">
                  <span className={`absolute left-0 h-[1.5px] w-5 bg-fg transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                  <span className={`absolute left-0 h-[1.5px] w-5 bg-fg transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
                </span>
              </button>
            </div>
          </div>

          {cur && hasMenu(cur) && menu && (
            <div className="absolute z-20 hidden pt-2 lg:block" style={cur.type === "mega" ? { left: 20, right: 20 } : { left: Math.max(20, menu.left + menu.width / 2 - 140) }} onMouseEnter={() => clearTimeout(closeT.current)} onMouseLeave={closeSoon}>
              <div className="chat-in overflow-hidden rounded-[var(--r-xl)] border border-line bg-bg/95 p-3 shadow-[0_30px_80px_-30px_rgb(0_0_0/.55)] backdrop-blur-2xl" style={cur.type === "mega" ? undefined : { width: 280 }}>
                {cur.type === "mega" ? (
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(cur.columns!.length, 4)}, minmax(0, 1fr))${cur.promo ? " minmax(0, 1.15fr)" : ""}` }}>
                    {cur.columns!.slice(0, 4).map((c, ci) => (
                      <div key={ci} className="p-3">
                        {c.title && <p className="mono-tag mb-3 text-muted">{c.title}</p>}
                        <ul className="space-y-0.5">{c.links.map((x) => (
                          <li key={x.href + x.label}><Link href={x.href} onClick={() => setMenu(null)} className="group block rounded-[var(--r-md)] px-3 py-2.5 transition-colors hover:bg-raised">
                            <span className="block font-medium text-fg transition-colors group-hover:text-accent">{x.label}</span>
                            {x.description && <span className="mt-0.5 block text-[0.84rem] leading-snug text-fg2">{x.description}</span>}
                          </Link></li>))}
                        </ul>
                      </div>
                    ))}
                    {cur.promo && (
                      <Link href={cur.promo.href} onClick={() => setMenu(null)} className="relative flex flex-col justify-end overflow-hidden rounded-[var(--r-lg)] p-5 text-onaccent" style={{ background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>
                        <p className="font-display text-xl font-bold leading-tight">{cur.promo.title}</p>
                        <p className="mt-1.5 text-sm opacity-90">{cur.promo.text}</p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">{cur.promo.label || "Learn more"} <span aria-hidden>→</span></span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-0.5">{cur.columns!.flatMap((c) => c.links).map((x) => (
                    <li key={x.href + x.label}><Link href={x.href} onClick={() => setMenu(null)} className="group block rounded-[var(--r-md)] px-3 py-2.5 transition-colors hover:bg-raised">
                      <span className="block font-medium text-fg transition-colors group-hover:text-accent">{x.label}</span>
                      {x.description && <span className="mt-0.5 block text-[0.84rem] leading-snug text-fg2">{x.description}</span>}
                    </Link></li>))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      <div id="mobile-nav" data-lenis-prevent className={`fixed inset-0 z-40 overflow-y-auto bg-bg transition-[clip-path] duration-700 ease-[cubic-bezier(.77,0,.18,1)] lg:hidden ${open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`} aria-hidden={!open}>
        <nav aria-label="Mobile" className="container-x flex min-h-full flex-col justify-center gap-1 py-28">
          {links.map((l, i) => hasMenu(l) ? (
            <div key={l.label + i}>
              <button type="button" tabIndex={open ? 0 : -1} aria-expanded={mobileOpen === i} onClick={() => setMobileOpen(mobileOpen === i ? null : i)} className="flex w-full items-center justify-between py-2 text-left">
                <span className={`font-display text-[clamp(2rem,9vw,3.4rem)] font-bold leading-[1.15] ${active(l) ? "text-accent" : "text-fg"}`}>{l.label}</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-fg2 transition-transform duration-300 ${mobileOpen === i ? "rotate-180" : ""}`} aria-hidden><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className={`grid transition-all duration-500 ${mobileOpen === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden">
                <div className="space-y-4 pb-4 pl-1">{l.columns!.map((c, ci) => (
                  <div key={ci}>{c.title && <p className="mono-tag mb-1.5 text-muted">{c.title}</p>}
                    <ul>{c.links.map((x) => <li key={x.href + x.label}><Link href={x.href} tabIndex={mobileOpen === i && open ? 0 : -1} className="block py-1.5 text-lg text-fg2 hover:text-accent">{x.label}</Link></li>)}</ul></div>))}</div>
              </div></div>
            </div>
          ) : (
            <Link key={l.href + l.label} href={l.href} tabIndex={open ? 0 : -1} className="word py-1"><span className={`font-display text-[clamp(2rem,9vw,3.4rem)] font-bold leading-[1.15] ${active(l) ? "text-accent" : "text-fg"}`} style={{ animation: open ? undefined : "none", animationDelay: `${120 + i * 60}ms` }}>{l.label}</span></Link>
          ))}
          {cta && <Link href={cta.href} tabIndex={open ? 0 : -1} className="btn btn-primary mt-8 self-start">{cta.label}</Link>}
        </nav>
      </div>
    </>
  );
}
