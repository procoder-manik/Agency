"use client";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import lottieLoader from "./lottie";
import { mediaKind } from "@/lib/media";

export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: any }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
}

export function Counter({ value, suffix = "", duration = 1600 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      if (reduce) return setN(value);
      const start = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - start) / duration); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

export function Tilt({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--ry", `${(x - 0.5) * 6}deg`); el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
  };
  const leave = () => { const el = ref.current; if (el) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); } };
  return <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`card tilt ${className}`} style={style}>{children}</div>;
}

/** Renders an image, animated GIF, looping muted video, Lottie JSON or YouTube URL. Lazy below the fold. */
export function Media({ src, alt = "", className = "", priority = false, cover = true }: { src: string; alt?: string; className?: string; priority?: boolean; cover?: boolean }) {
  const kind = mediaKind(src);
  const ref = useRef<HTMLDivElement>(null);
  const vref = useRef<HTMLVideoElement>(null);
  const fit = cover ? "object-cover" : "object-contain";
  useEffect(() => {
    if (kind === "lottie" && ref.current) {
      let anim: any; let cancelled = false;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const io = new IntersectionObserver(async ([e]) => {
        if (!e.isIntersecting || anim) return;
        const lottie = await lottieLoader(); if (cancelled || !ref.current) return;
        anim = lottie.loadAnimation({ container: ref.current, renderer: "svg", loop: !reduce, autoplay: !reduce, path: src });
      }); io.observe(ref.current);
      return () => { cancelled = true; io.disconnect(); anim?.destroy(); };
    }
    if (kind === "video" && vref.current && window.matchMedia("(prefers-reduced-motion: reduce)").matches) vref.current.pause();
  }, [kind, src]);
  if (kind === "none") return null;
  if (kind === "youtube") {
    const id = src.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
    return <div className={`aspect-video overflow-hidden ${className}`}><iframe className="h-full w-full" loading="lazy" src={`https://www.youtube-nocookie.com/embed/${id}`} title={alt || "Video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>;
  }
  if (kind === "video") return <video ref={vref} className={`${fit} ${className}`} src={src} autoPlay muted loop playsInline preload={priority ? "auto" : "none"} aria-label={alt} />;
  if (kind === "lottie") return <div ref={ref} className={className} role="img" aria-label={alt} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`${fit} ${className}`} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} />;
}
