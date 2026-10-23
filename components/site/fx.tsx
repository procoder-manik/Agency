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
  return <><canvas ref={ref} className="hero-canvas" aria-hidden /><Particles /></>;
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

/* ---------- Constellation of particles that react to the pointer ---------- */
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv || reduced()) return; const ctx = cv.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, vis = true; let col = cssRgb("accent");
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let ps: P[] = [];
    const size = () => {
      const r = cv.getBoundingClientRect(); w = cv.width = Math.max(1, r.width * dpr); h = cv.height = Math.max(1, r.height * dpr);
      const n = Math.round(Math.min(64, Math.max(20, (r.width * r.height) / 28000)));
      ps = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28 * dpr, vy: (Math.random() - 0.5) * 0.28 * dpr, r: (Math.random() * 1.4 + 0.7) * dpr }));
    };
    const rgba = (a: number) => col.replace("rgb(", "rgba(").replace(")", `,${a})`);
    const loop = () => {
      if (vis) {
        ctx.clearRect(0, 0, w, h); const link = 150 * dpr; const rad = 190 * dpr;
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i]; p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d > 0 && d < rad) { const f = (1 - d / rad) * 0.9 * dpr; p.x += (dx / d) * f; p.y += (dy / d) * f; }
          ctx.fillStyle = rgba(0.75); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
          for (let j = i + 1; j < ps.length; j++) {
            const q = ps[j]; const dd = Math.hypot(p.x - q.x, p.y - q.y);
            if (dd < link) { ctx.strokeStyle = rgba(0.2 * (1 - dd / link)); ctx.lineWidth = dpr * 0.8; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * dpr; mouse.y = (e.clientY - r.top) * dpr; };
    const onMode = () => { col = cssRgb("accent"); };
    size(); const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting)); io.observe(cv);
    window.addEventListener("resize", size); window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("modechange", onMode);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", size); window.removeEventListener("pointermove", move); window.removeEventListener("modechange", onMode); };
  }, []);
  return <canvas ref={ref} className="hero-canvas !opacity-70" aria-hidden />;
}

/* ---------- Pointer spotlight that reveals a faint grid across the whole page ---------- */
export function Ambient() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fine() || reduced()) return;
    let x = innerWidth / 2, y = innerHeight / 3, cx = x, cy = y, raf = 0;
    const mv = (e: PointerEvent) => { x = e.clientX; y = e.clientY; };
    const loop = () => { cx += (x - cx) * 0.08; cy += (y - cy) * 0.08; ref.current?.style.setProperty("--sx", cx.toFixed(1) + "px"); ref.current?.style.setProperty("--sy", cy.toFixed(1) + "px"); raf = requestAnimationFrame(loop); };
    window.addEventListener("pointermove", mv, { passive: true }); raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="ambient" aria-hidden />;
}

/* ---------- Decode / scramble text effect ---------- */
export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return; if (reduced()) { el.textContent = text; return; }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/"; let raf = 0;
    const run = () => {
      const start = performance.now(); const dur = 600 + text.length * 30;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur); let out = "";
        for (let i = 0; i < text.length; i++) out += text[i] === " " || i < text.length * p ? text[i] : chars[Math.floor(Math.random() * chars.length)];
        el.textContent = out; if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el); return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [text]);
  return <span className={className}><span ref={ref} aria-hidden>{text}</span><span className="sr-only">{text}</span></span>;
}
