"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChatIcon } from "./chat-icons";
import { trackLead } from "@/lib/track";
import { playKey, playReceive, playSend, setSoundPref, soundPref } from "@/lib/chat-sound";

type Link_ = { label: string; href: string };
interface Msg { id: number; role: "user" | "assistant"; text: string; links?: Link_[]; suggestions?: string[]; lead?: boolean; leadDone?: boolean; error?: boolean; retry?: string }
const KEY = "chat:v3";
let uid = Date.now();

/* ---- tiny markdown: **bold**, [text](/path), bare /paths, "- " lists, "1. " lists ---- */
function inline(text: string, k: string): ReactNode[] {
  const out: ReactNode[] = []; const rx = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:\/|https?:)[^)]*\))/g; let last = 0; let m: RegExpExecArray | null; let i = 0;
  while ((m = rx.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={`${k}b${i++}`} className="font-semibold">{t.slice(2, -2)}</strong>);
    else { const mm = t.match(/\[([^\]]+)\]\(([^)]*)\)/)!; out.push(<Link key={`${k}l${i++}`} href={mm[2]} className="underline underline-offset-2">{mm[1]}</Link>); }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function Rich({ text }: { text: string }) {
  const lines = text.split("\n"); const blocks: ReactNode[] = []; let list: string[] = []; let ordered = false;
  const flush = (k: number) => { if (!list.length) return; const items = list.map((x, i) => <li key={i}>{inline(x, `${k}-${i}`)}</li>); blocks.push(ordered ? <ol key={`o${k}`} className="my-1 list-decimal space-y-1 pl-5">{items}</ol> : <ul key={`u${k}`} className="my-1 list-disc space-y-1 pl-5">{items}</ul>); list = []; };
  lines.forEach((ln, i) => {
    const b = ln.match(/^\s*[-*]\s+(.*)/); const n = ln.match(/^\s*\d+\.\s+(.*)/);
    if (b) { if (list.length && ordered) flush(i); ordered = false; list.push(b[1]); }
    else if (n) { if (list.length && !ordered) flush(i); ordered = true; list.push(n[1]); }
    else { flush(i); if (ln.trim()) blocks.push(<p key={i} className="my-1">{inline(ln, String(i))}</p>); }
  });
  flush(lines.length);
  return <>{blocks}</>;
}

export function ChatWidget({ side, greeting, name, suggestions, leadCapture, sound = true, icon = "bubble", iconImage = "", waUrl = "", whatsappText = "", animation = "ring" }: { side: "left" | "right"; greeting: string; name: string; suggestions: string[]; leadCapture: boolean; sound?: boolean; icon?: string; iconImage?: string; waUrl?: string; whatsappText?: string; animation?: string }) {
  const wa = waUrl;
  const [open, setOpen] = useState(false); const [msgs, setMsgs] = useState<Msg[]>([]); const [input, setInput] = useState(""); const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(false); const [hint, setHint] = useState(false); const [muted, setMuted] = useState(false);
  const ping = useRef({ key: playKey, send: playSend, recv: playReceive });
  const listRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null); const launcher = useRef<HTMLButtonElement>(null);
  const defaults = suggestions.length ? suggestions : ["What services do you offer?", "How much does it cost?", "Show me your work", "Talk to a human"];
  const fresh = useCallback((): Msg[] => [{ id: ++uid, role: "assistant", text: greeting, suggestions: defaults.slice(0, 4) }], [greeting]); // eslint-disable-line

  useEffect(() => {
    try { const raw = sessionStorage.getItem(KEY); const saved = raw ? (JSON.parse(raw) as Msg[]) : null; setMsgs(saved && saved.length ? saved : fresh()); } catch { setMsgs(fresh()); }
    try { if (!sessionStorage.getItem("chat:hint")) { const t = setTimeout(() => { setHint(true); sessionStorage.setItem("chat:hint", "1"); }, 9000); return () => clearTimeout(t); } } catch {}
  }, [fresh]);
  useEffect(() => { setMuted(!soundPref()); }, []);
  const beep = (k: "key" | "send" | "recv") => { if (sound && !muted) ping.current[k](); };
  useEffect(() => { try { if (msgs.length) sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch {} }, [msgs]);
  useEffect(() => { const el = listRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [msgs, busy, open]);
  useEffect(() => { if (open) { setUnread(false); setHint(false); setTimeout(() => inputRef.current?.focus(), 250); } }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) { setOpen(false); launcher.current?.focus(); } };
    const onOpen = (e: Event) => { setOpen(true); const m = (e as CustomEvent).detail?.message; if (m) setTimeout(() => send(m), 300); };
    const onClick = (e: MouseEvent) => { const a = (e.target as HTMLElement)?.closest?.('a[href="#chat"]'); if (a) { e.preventDefault(); setOpen(true); } };
    window.addEventListener("keydown", onKey); window.addEventListener("open-chat", onOpen); document.addEventListener("click", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-chat", onOpen); document.removeEventListener("click", onClick); };
  }); // eslint-disable-line

  async function send(text: string) {
    const q = text.trim(); if (!q || busy) return;
    setInput(""); setBusy(true); beep("send");
    const userMsg: Msg = { id: ++uid, role: "user", text: q };
    const history = [...msgs.filter((m) => !m.error), userMsg];
    setMsgs((m) => [...m.map((x) => ({ ...x, suggestions: undefined })), userMsg]);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-10).map((m) => ({ role: m.role, content: m.text })) }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Request failed");
      const wantLead = !!j.lead && leadCapture;
      setMsgs((m) => [...m, { id: ++uid, role: "assistant", text: j.answer, links: j.links, suggestions: wantLead ? [] : j.suggestions, lead: wantLead }]);
      if (!open) setUnread(true);
      beep("recv");
    } catch (e: any) {
      setMsgs((m) => [...m, { id: ++uid, role: "assistant", text: e?.message && !/fetch|network|Failed/i.test(e.message) ? e.message : "I couldn't reach the server. Please check your connection and try again.", error: true, retry: q }]);
    }
    setBusy(false);
  }

  async function submitLead(id: number, v: { name: string; email: string; message: string; _hp: string }) {
    const r = await fetch("/api/chat/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...v, transcript: msgs.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.text })) }) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "Couldn't send. Please try again.");
    beep("send"); trackLead("chat");
    setMsgs((m) => [...m.map((x) => (x.id === id ? { ...x, leadDone: true } : x)), { id: ++uid, role: "assistant", text: `Thanks ${v.name.split(" ")[0]}! The team has your details and will reply to ${v.email} soon.${wa ? " Need an answer sooner?" : ""}`, links: wa ? [{ label: "Message us on WhatsApp", href: wa }] : undefined, suggestions: defaults.filter((d) => !/human/i.test(d)).slice(0, 3) }]);
  }

  const reset = () => { const f = fresh(); setMsgs(f); try { sessionStorage.setItem(KEY, JSON.stringify(f)); } catch {} };
  const lastBot = [...msgs].reverse().find((m) => m.role === "assistant");
  const initials = (name || "AI").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="fixed bottom-5 z-[55]" style={{ [side]: 20 } as any}>
      {open && (
        <div role="dialog" aria-label={`Chat with ${name}`} data-lenis-prevent
          className="chat-panel fixed inset-0 z-[56] flex flex-col overflow-hidden border border-line bg-surface/95 shadow-2xl backdrop-blur-2xl sm:absolute sm:inset-auto sm:bottom-[76px] sm:h-[min(640px,calc(100vh-130px))] sm:w-[390px] sm:rounded-[var(--r-xl)]" style={{ [side]: 0 } as any}>
          <div className="relative flex items-center gap-3 border-b border-line px-4 py-3.5" style={{ background: "linear-gradient(135deg, rgb(var(--c-accent) / .16), rgb(var(--c-accent2) / .08))" }}>
            <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full font-display text-sm font-bold text-onaccent" style={{ background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>{iconImage ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={iconImage} alt="" className="h-full w-full object-cover" /> : initials}</span>
            <div className="min-w-0 flex-1"><p className="truncate font-display font-semibold leading-tight">{name}</p><p className="flex items-center gap-1.5 text-xs text-fg2"><span className="pulse-dot !h-1.5 !w-1.5" />Online, replies instantly</p></div>
            {sound && <button type="button" onClick={() => { const next = !muted; setMuted(next); setSoundPref(!next); if (!next) playReceive(); }} title={muted ? "Turn sound on" : "Turn sound off"} aria-label={muted ? "Turn chat sound on" : "Turn chat sound off"} aria-pressed={!muted} className="grid h-10 w-10 place-items-center rounded-full text-fg2 transition-colors hover:bg-raised hover:text-fg">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 5 6 9H2v6h4l5 4V5z" />{muted ? <path d="m22 9-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}</svg></button>}
            <button type="button" onClick={reset} title="Start over" aria-label="Start a new conversation" className="grid h-10 w-10 place-items-center rounded-full text-fg2 transition-colors hover:bg-raised hover:text-fg">↺</button>
            <button type="button" onClick={() => { setOpen(false); launcher.current?.focus(); }} aria-label="Close chat" className="grid h-10 w-10 place-items-center rounded-full text-fg2 transition-colors hover:bg-raised hover:text-fg">✕</button>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 text-[0.95rem]" aria-live="polite" aria-relevant="additions">
            {msgs.map((m) => (
              <div key={m.id} className={`chat-in flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[88%] px-4 py-2.5 leading-relaxed ${m.role === "user" ? "rounded-2xl rounded-br-md text-onaccent" : `rounded-2xl rounded-bl-md bg-raised text-fg ${m.error ? "!bg-danger/10 text-danger" : ""}`}`}
                  style={m.role === "user" ? { background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" } : undefined}>
                  <Rich text={m.text} />
                </div>
                {m.error && m.retry && <button type="button" onClick={() => { setMsgs((x) => x.filter((y) => y.id !== m.id)); send(m.retry!); }} className="mt-1.5 text-xs text-accent hover:underline">Try again</button>}
                {m.links && m.links.length > 0 && <div className="mt-2 flex max-w-[92%] flex-wrap gap-1.5">{m.links.map((l) => /^https?:/i.test(l.href) ? <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="chip hover:!border-accent hover:!text-fg">{l.label} <span aria-hidden>↗</span></a> : <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="chip hover:!border-accent hover:!text-fg">{l.label} <span aria-hidden>↗</span></Link>)}</div>}
                {m.lead && !m.leadDone && <LeadCard defaultMessage={[...msgs].reverse().find((x) => x.role === "user")?.text || ""} onSubmit={(v) => submitLead(m.id, v)} />}
                {m.id === lastBot?.id && !busy && m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-2.5 flex max-w-[95%] flex-wrap gap-1.5">{m.suggestions.map((sg) => <button key={sg} type="button" onClick={() => send(sg)} className="rounded-full border border-accent/40 px-3 py-1.5 text-[0.82rem] text-fg transition-all hover:bg-accent hover:text-onaccent">{sg}</button>)}</div>
                )}
              </div>
            ))}
            {busy && <div className="chat-in flex items-start"><div className="dots flex gap-1.5 rounded-2xl rounded-bl-md bg-raised px-4 py-3.5" aria-label="Typing"><span /><span /><span /></div></div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-line p-3">
            <div className="flex items-center gap-2 rounded-full border border-line bg-bg/60 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-accent">
              <label htmlFor="chat-input" className="sr-only">Your message</label>
              <input id="chat-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key.length === 1 || e.key === "Backspace") beep("key"); }} maxLength={500} placeholder="Ask about services, pricing, work…" autoComplete="off" className="min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none placeholder:text-muted" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-onaccent transition-all hover:scale-105 disabled:scale-100 disabled:opacity-40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
            {wa && <p className="mt-2 text-center text-xs text-fg2">{whatsappText || "Can't reach us here?"} <a href={wa} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">Message us on WhatsApp</a></p>}
            <p className="mt-2 text-center text-[0.7rem] text-muted">Answers come from this website. For anything important, <Link href="/contact" className="underline" onClick={() => setOpen(false)}>contact the team</Link>.</p>
          </form>
        </div>
      )}

      {hint && !open && (
        <button type="button" onClick={() => setOpen(true)} className="chat-in absolute bottom-[76px] w-max max-w-[240px] rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm shadow-xl" style={{ [side]: 0 } as any}>
          <span className="block font-medium text-fg">Questions? Ask us</span><span className="text-fg2">We can answer about pricing and services.</span>
        </button>
      )}
      <button ref={launcher} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close chat" : "Open chat"}
        className={`chat-launcher relative grid h-14 w-14 place-items-center rounded-full text-white ${!open && animation === "breathe" ? "chat-breathe" : ""} ${!open && animation === "wiggle" ? "chat-wiggle" : ""}`}>
        {!open && animation === "ring" && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-duration:2.6s]" />}
        <span aria-hidden className="chat-launcher-glow" />
        {open ? <svg className="relative" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          : iconImage ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={iconImage} alt="" className="relative h-8 w-8 rounded-full object-contain" /> : <ChatIcon id={icon} className="relative" />}
        {unread && !open && <span aria-label="New message" className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-bg bg-danger" />}
      </button>
    </div>
  );
}

function LeadCard({ defaultMessage, onSubmit }: { defaultMessage: string; onSubmit: (v: { name: string; email: string; message: string; _hp: string }) => Promise<void> }) {
  const [v, setV] = useState({ name: "", email: "", message: defaultMessage, _hp: "" }); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  return (
    <form className="chat-in mt-2.5 w-full max-w-[95%] space-y-2.5 rounded-2xl border border-line bg-bg/60 p-3.5" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { await onSubmit(v); } catch (x: any) { setErr(x.message); setBusy(false); } }}>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={v._hp} onChange={(e) => setV({ ...v, _hp: e.target.value })} />
      <div><label className="sr-only" htmlFor="lead-name">Your name</label><input id="lead-name" className="input !py-2.5 text-sm" placeholder="Your name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} required maxLength={120} autoComplete="name" /></div>
      <div><label className="sr-only" htmlFor="lead-email">Your email</label><input id="lead-email" type="email" className="input !py-2.5 text-sm" placeholder="Your email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} required maxLength={200} autoComplete="email" /></div>
      <div><label className="sr-only" htmlFor="lead-msg">Message</label><textarea id="lead-msg" className="input !py-2.5 text-sm" rows={3} placeholder="What do you need help with?" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} maxLength={2000} /></div>
      {err && <p className="text-xs text-danger" role="alert">{err}</p>}
      <button className="btn btn-primary w-full !py-2.5 text-sm" disabled={busy}>{busy ? "Sending…" : "Send to the team"}</button>
    </form>
  );
}
