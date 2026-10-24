/** Soft, synthesised chat sounds (no audio files). Typing tick, send, receive. Browser-only. */
let ctx: AudioContext | null = null;
let lastTick = 0;
const KEY = "chat:sound";

export const soundPref = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export const setSoundPref = (on: boolean) => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {} };

function ac() {
  try {
    if (!ctx) { const C = window.AudioContext || (window as any).webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches && false; // sound is not motion

function tone(freq: number, start: number, dur: number, vol: number, type: OscillatorType = "sine", slideTo?: number) {
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}

/** A tiny keyboard "tick" for each keystroke (throttled, slightly varied so it feels natural). */
export function playKey() {
  if (reduced()) return; const now = performance.now(); if (now - lastTick < 55) return; lastTick = now;
  const f = 1500 + Math.random() * 350;
  tone(f, 0, 0.035, 0.035, "triangle", f * 0.62);
}
/** Message sent: a soft rising pop. */
export function playSend() { tone(520, 0, 0.09, 0.07, "sine", 780); tone(780, 0.07, 0.12, 0.05, "sine", 1040); }
/** Reply received: a gentle two-note chime. */
export function playReceive() { tone(660, 0, 0.14, 0.06); tone(880, 0.11, 0.2, 0.05); }
