"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function HeaderShell({ logo, links, cta }: { logo: ReactNode; links: { label: string; href: string }[]; cta?: { label: string; href: string } }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 12); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const active = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));
  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-line/70 bg-bg/75 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="Home">{logo}</Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} className={`rounded-full px-3.5 py-2 text-[0.95rem] transition-colors ${active(l.href) ? "text-fg bg-raised/70" : "text-fg2 hover:text-fg"}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {cta && <Link href={cta.href} className="btn btn-primary hidden !py-2.5 sm:inline-flex">{cta.label}</Link>}
          <button className="btn btn-ghost !px-3 !py-2.5 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden">
          <div className="container-x flex flex-col py-3">
            {links.map((l) => <Link key={l.href + l.label} href={l.href} className={`py-3 text-lg ${active(l.href) ? "text-accent" : "text-fg"}`}>{l.label}</Link>)}
            {cta && <Link href={cta.href} className="btn btn-primary mt-3">{cta.label}</Link>}
          </div>
        </nav>
      )}
    </header>
  );
}
