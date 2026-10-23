"use client";
/** Site-wide effects: smooth scroll, cursor, scroll progress, intro, mode toggle, hero canvas, magnetic, split text, parallax. */
import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { usePathname } from "next/navigation";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const cssRgb = (name: string) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--c-${name}`).trim().replace(/\s+/g, ",")})`;

/* ---------- Smooth scroll (Lenis) + scroll progress + velocity skew ---------- */
export function SmoothScroll({ enabled }: { enabled: boolean }) {
  const path = usePathname();
  const lenisRef = useRef<any>(null);
  useEffect(() => {
    let raf = 0; let lenis: any; let last = window.scrollY; let skew = 0;
    const bar = document.querySelector<HTMLElement>(".scroll-progress");
    const onFrame = () => {
      const y = window.scrollY; const max = document.documentElement.scrollHeight - innerHeight;
      bar?.style.setProperty("--p", String(max > 0 ? y / max : 0));
      const v = y - last; last = y; skew += (Math.max(-6, Math.min(6, v * 0.12)) - skew) * 0.12;
      document.documentElement.style.setProperty("--skew", reduced() ? "0" : skew.toFixed(2));
    };
    const loop = (t: number) => { lenis?.raf(t); onFrame(); raf = requestAnimationFrame(loop); };
    (async () => {
      if (enabled && !reduced()) {
        const { default: Lenis } = await import("lenis");
        lenis = new Lenis({ duration: 1.15, easing: (x: number) => Math.min(1, 1.001 - Math.pow(2, -10 * x)), smoothWheel: true });
        lenisRef.current = lenis;
      }
      raf = requestAnimationFrame(loop);
    })();
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); lenisRef.current = null; };
  }, [enabled]);
  useEffect(() => { lenisRef.current ? lenisRef.current.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0); }, [path]);
  return <div className="scroll-progress" aria-hidden />;
}

/* ---------- Custom cursor ---------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null); const ring = useRef<HTMLDivElement>(null); const [label, setLabel] = useState("");
  useEffect(() => {
    if (!fine() || reduced()) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button, input, textarea, select, summary") as HTMLElement | null;
      const l = t?.dataset?.cursor || "";
      ring.current?.classList.toggle("is-label", !!l); ring.current?.classList.toggle("is-link", !!t && !l); setLabel(l);
    };
    const loop = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop); };
    window.addEventListener("pointermove", move, { passive: true }); raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return <><div ref={dot} className="cursor-dot" aria-hidden /><div ref={ring} className="cursor-ring" aria-hidden><span>{label}</span></div></>;
}

/* ---------- Intro curtain (once per session) ---------- */
export function Intro({ name }: { name: string }) {
  const [state, setState] = useState<"show" | "out" | "gone">("show");
  useEffect(() => {
    try { if (sessionStorage.getItem("intro") || reduced()) return setState("gone"); sessionStorage.setItem("intro", "1"); } catch { return setState("gone"); }
    const a = setTimeout(() => setState("out"), 1150); const b = setTimeout(() => setState("gone"), 2200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (state === "gone") return null;
  return (
    <div className={`intro ${state === "out" ? "out" : ""}`} aria-hidden>
      <div className="w-[min(420px,80vw)] text-center">
        <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl"><span className="word"><span>{name}</span></span></p>
        <div className="mt-6 h-[2px] overflow-hidden bg-line"><div className="intro-bar" /></div>
      </div>
    </div>
  );
}

/* ---------- Dark / light toggle ---------- */
export function ModeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const d = document.documentElement; const next = d.dataset.mode === "dark" ? "light" : "dark";
    const apply = () => { d.dataset.mode = next; d.classList.toggle("dark", next === "dark"); try { localStorage.setItem("mode", next); } catch {} window.dispatchEvent(new Event("modechange")); };
    const vt = (document as any).startViewTransition;
    if (vt && !reduced()) vt.call(document, apply); else apply();
  };
  return (
    <button type="button" onClick={toggle} aria-label="Switch dark or light mode" title="Dark / light"
      className={`mode-toggle relative grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/40 text-fg backdrop-blur transition-colors hover:border-fg/40 ${className}`}>
      <svg className="sun absolute" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg className="moon absolute" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" /></svg>
    </button>
  );
}

/* ---------- Magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || e.pointerType !== "mouse" || reduced()) return;
    const r = el.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2); const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return <span ref={ref} onPointerMove={move} onPointerLeave={leave} className={`inline-block transition-transform duration-500 ease-out ${className}`}>{children}</span>;
}

/* ---------- Split text reveal on scroll ---------- */
export function SplitText({ text, as: Tag = "h2", className = "" }: { text: string; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => <span key={i} className="word" aria-hidden><span style={{ ["--i" as any]: i }}>{w}</span>{i < words.length - 1 ? "\u00a0" : ""}</span>)}
    </Tag>
  );
}

/* ---------- Parallax (translate on scroll) ---------- */
export function Parallax({ children, speed = 0.12, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced()) return; let raf = 0;
    const tick = () => { const el = ref.current; if (el) { const r = el.getBoundingClientRect(); const c = r.top + r.height / 2 - innerHeight / 2; el.style.transform = `translate3d(0, ${(-c * speed).toFixed(1)}px, 0)`; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [speed]);
  return <div ref={ref} className={`will-change-transform ${className}`}>{children}</div>;
}

/* ---------- Clip reveal for images ---------- */
export function ClipReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`clip overflow-hidden ${className}`} style={{ transitionDelay: `${delay}ms` }}><div className="clip-inner h-full w-full">{children}</div></div>;
}

/* ---------- Interactive gradient field behind the hero ---------- */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return; const ctx = cv.getContext("2d"); if (!ctx) return;
    let w = 0, h = 0, raf = 0, visible = true, t = 0;
    let cols = [cssRgb("accent"), cssRgb("accent2"), cssRgb("accent")]; let light = document.documentElement.dataset.mode === "light";
    const onMode = () => { cols = [cssRgb("accent"), cssRgb("accent2"), cssRgb("accent")]; light = document.documentElement.dataset.mode === "light"; if (reduced()) draw(); };
    const p = { x: 0.7, y: 0.35, tx: 0.7, ty: 0.35 };
    const blobs = [{ x: .2, y: .3, r: .55, s: .9, c: 0 }, { x: .8, y: .2, r: .45, s: 1.2, c: 1 }, { x: .55, y: .75, r: .5, s: .7, c: 2 }, { x: .1, y: .8, r: .35, s: 1.4, c: 1 }];
    const size = () => { const r = cv.getBoundingClientRect(); const dpr = Math.min(1.5, devicePixelRatio || 1) * 0.5; w = cv.width = Math.max(1, r.width * dpr); h = cv.height = Math.max(1, r.height * dpr); };
    const draw = () => {
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = light ? "multiply" : "lighter";
      const m = Math.max(w, h);
      blobs.forEach((b, i) => {
        const bx = (b.x + Math.sin(t * 0.0004 * b.s + i) * 0.08) * w; const by = (b.y + Math.cos(t * 0.0005 * b.s + i * 2) * 0.08) * h;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r * m); g.addColorStop(0, cols[b.c].replace("rgb", "rgba").replace(")", light ? ",.28)" : ",.42)")); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      p.x += (p.tx - p.x) * 0.05; p.y += (p.ty - p.y) * 0.05;
      const g = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, 0.32 * m); g.addColorStop(0, cols[1].replace("rgb", "rgba").replace(")", light ? ",.25)" : ",.5)")); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    };
    const loop = (now: number) => { t = now; if (visible) draw(); raf = requestAnimationFrame(loop); };
    const move = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); p.tx = (e.clientX - r.left) / r.width; p.ty = (e.clientY - r.top) / r.height; };
    size(); const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(cv);
    window.addEventListener("resize", size); window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("modechange", onMode);
    if (reduced()) draw(); else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", size); window.removeEventListener("pointermove", move); window.removeEventListener("modechange", onMode); };
  }, []);
  return <canvas ref={ref} className="hero-canvas" aria-hidden />;
}

/* ---------- Rotating circular text badge ---------- */
export function RotatingBadge({ text, href }: { text: string; href?: string }) {
  const t = `${text} • ${text} • `;
  const inner = (
    <span className="relative grid h-32 w-32 place-items-center sm:h-36 sm:w-36">
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
        <defs><path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
        <text fontSize="8.4" letterSpacing="1.6" fill="currentColor" className="text-fg2"><textPath href="#circ">{t}</textPath></text>
      </svg>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-xl text-onaccent transition-transform duration-500 group-hover:rotate-45">↗</span>
    </span>
  );
  return href ? <a href={href} className="group inline-block" aria-label={text}>{inner}</a> : inner;
}

/* ---------- Live local clock (footer) ---------- */
export function Clock({ tz }: { tz?: string }) {
  const [now, setNow] = useState("");
  useEffect(() => { const f = () => { try { setNow(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: tz || undefined })); } catch { setNow(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })); } }; f(); const i = setInterval(f, 15000); return () => clearInterval(i); }, [tz]);
  return <span suppressHydrationWarning>{now}</span>;
}
