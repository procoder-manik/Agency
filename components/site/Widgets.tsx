"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatWidget } from "./Chat";

type Side = "left" | "right";

export function FloatingWidgets({ chat, wa, backToTop }: { chat: null | { side: Side; greeting: string; mode: string; name: string; botName: string; suggestions: string[]; leadCapture: boolean; sound?: boolean; icon?: string; iconImage?: string; waUrl?: string; whatsappText?: string; animation?: string }; wa?: null | { url: string; text: string; side: Side }; backToTop: null | { side: Side; offset?: number } }) {
  const stacked = chat && backToTop && chat.side === backToTop.side;
  return (
    <>
      {chat?.mode === "builtin" && <ChatWidget side={chat.side} greeting={chat.greeting} name={chat.botName || chat.name} suggestions={chat.suggestions} leadCapture={chat.leadCapture} sound={chat.sound !== false} icon={chat.icon} iconImage={chat.iconImage} waUrl={chat.waUrl} whatsappText={chat.whatsappText} animation={chat.animation} />}
      {wa && <a href={wa.url} target="_blank" rel="noopener noreferrer" style={{ [wa.side]: "1.25rem" } as React.CSSProperties} className="fixed bottom-5 z-40 rounded-full border border-line bg-surface/90 px-4 py-2.5 text-sm font-semibold text-fg shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#25D366] hover:shadow-xl"><span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-[#25D366]" />{wa.text}</a>}
      {backToTop && <BackToTop side={backToTop.side} raised={!!stacked} offset={backToTop.offset} />}
    </>
  );
}

function BackToTop({ side, raised, offset = 0 }: { side: Side; raised: boolean; offset?: number }) {
  const [show, setShow] = useState(false); const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const f = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); setP(Math.min(1, window.scrollY / max)); setShow(window.scrollY > 280); }); };
    f(); window.addEventListener("scroll", f, { passive: true }); window.addEventListener("resize", f);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", f); window.removeEventListener("resize", f); };
  }, []);
  const R = 21, C = 2 * Math.PI * R;
  return (
    <button aria-label={`Back to top (${Math.round(p * 100)}% scrolled)`} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={`btt group fixed z-[70] grid h-12 w-12 place-items-center rounded-full text-fg transition-all duration-500 ease-out ${show ? "scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-75 opacity-0"}`}
      style={{ [side]: 20 + offset, bottom: raised ? 92 : 20 } as any}>
      <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48" aria-hidden>
        <defs><linearGradient id="btt-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: "rgb(var(--c-accent))" }} /><stop offset="1" style={{ stopColor: "rgb(var(--c-accent2))" }} /></linearGradient></defs>
        <circle cx="24" cy="24" r={R} fill="none" stroke="rgb(var(--c-line))" strokeWidth="2.5" />
        <circle cx="24" cy="24" r={R} fill="none" stroke="url(#btt-g)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} style={{ transition: "stroke-dashoffset .15s linear", filter: "drop-shadow(0 0 3px rgb(var(--c-accent) / .6))" }} />
      </svg>
      <span className="btt-fill absolute inset-[5px] rounded-full bg-surface/90 backdrop-blur transition-colors duration-300 group-hover:bg-accent" />
      <svg className="btt-arrow relative transition-colors group-hover:text-onaccent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}

export function Announcements({ items }: { items: { id: number; kind: string; content: string; linkLabel?: string; linkHref?: string; trigger?: string; delay?: number; paths?: string }[] }) {
  const path = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closed, setClosed] = useState<number[]>([]);
  const [popupOpen, setPopupOpen] = useState<number | null>(null);
  useEffect(() => { try { setClosed(JSON.parse(localStorage.getItem("dismissed") || "[]")); } catch {} }, []);
  const match = (p?: string) => !p || p.split(",").map((s) => s.trim()).filter(Boolean).some((x) => path === x || (x.endsWith("*") && path.startsWith(x.slice(0, -1))));
  const visible = items.filter((i) => !closed.includes(i.id) && match(i.paths));
  const bar = visible.find((i) => i.kind !== "popup");
  const popup = visible.find((i) => i.kind === "popup");
  const dismiss = (id: number) => {
    const n = [...closed, id]; setClosed(n); setPopupOpen(null);
    try { localStorage.setItem("dismissed", JSON.stringify(n)); } catch {}
  };
  // The bar scrolls away with the page; the header and page padding follow its measured height.
  useEffect(() => {
    const root = document.documentElement;
    if (!bar) { root.style.setProperty("--bar-h", "0px"); return; }
    root.removeAttribute("data-bar-closed");
    const el = barRef.current; if (!el) return;
    const set = () => root.style.setProperty("--bar-h", el.offsetHeight + "px");
    set(); const ro = new ResizeObserver(set); ro.observe(el);
    return () => ro.disconnect();
  }, [bar?.id]); // eslint-disable-line
  useEffect(() => {
    if (!popup) return;
    if (popup.trigger === "scroll") { const f = () => { if (window.scrollY > (document.body.scrollHeight - innerHeight) / 2) { setPopupOpen(popup.id); window.removeEventListener("scroll", f); } }; window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }
    if (popup.trigger === "exit") { const f = (e: MouseEvent) => { if (e.clientY < 5) setPopupOpen(popup.id); }; document.addEventListener("mouseout", f); return () => document.removeEventListener("mouseout", f); }
    const t = setTimeout(() => setPopupOpen(popup.id), (Number(popup.delay) || 6) * 1000); return () => clearTimeout(t);
  }, [popup?.id]); // eslint-disable-line
  useEffect(() => {
    if (popupOpen === null) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && popup && dismiss(popup.id);
    window.addEventListener("keydown", f); closeRef.current?.focus();
    return () => window.removeEventListener("keydown", f);
  }, [popupOpen]); // eslint-disable-line
  return (
    <>
      {bar && (
        <div ref={barRef} className="announce-bar text-onaccent" role="region" aria-label="Announcement" style={{ background: "linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>
          <div className="container-x flex min-h-[44px] flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-2 pl-2 pr-14 text-center text-sm font-medium">
            <span>{bar.content}</span>
            {bar.linkHref && <Link href={bar.linkHref} className="underline underline-offset-4">{bar.linkLabel || "Learn more"}</Link>}
          </div>
          <button type="button" onClick={() => dismiss(bar.id)} aria-label="Close announcement" className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-black/20">✕</button>
        </div>
      )}
      {popup && popupOpen === popup.id && (
        <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-bg/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Announcement" data-lenis-prevent onClick={() => dismiss(popup.id)}>
          <div className="glass fade-in relative w-full max-w-md !bg-surface p-7" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" onClick={() => dismiss(popup.id)} aria-label="Close" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-fg2 hover:bg-raised hover:text-fg">✕</button>
            <p className="pr-8 text-lg text-fg">{popup.content}</p>
            <div className="mt-6 flex gap-3">
              {popup.linkHref && <Link href={popup.linkHref} className="btn btn-primary" onClick={() => dismiss(popup.id)}>{popup.linkLabel || "Learn more"}</Link>}
              <button className="btn btn-ghost" onClick={() => dismiss(popup.id)}>No thanks</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Analytics({ id }: { id: string }) {
  useEffect(() => {
    if (!/^G-[A-Z0-9]+$|^UA-\d+-\d+$/.test(id)) return;
    const s = document.createElement("script"); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`; document.head.appendChild(s);
    const w = window as any; w.dataLayer = w.dataLayer || []; w.gtag = function () { w.dataLayer.push(arguments); }; w.gtag("js", new Date()); w.gtag("config", id);
  }, [id]);
  return null;
}

export function ThirdPartyChat({ html }: { html: string }) {
  useEffect(() => {
    const box = document.createElement("div"); box.innerHTML = html;
    const added: Element[] = [];
    box.querySelectorAll("script").forEach((old) => { const s = document.createElement("script"); for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value); s.text = old.text; document.body.appendChild(s); added.push(s); });
    return () => added.forEach((n) => n.remove());
  }, [html]);
  return null;
}
