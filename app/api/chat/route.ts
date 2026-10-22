export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getPublished } from "@/lib/content";
import { getAllSettings } from "@/lib/settings";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { aiAvailable } from "@/lib/ai/providers";
import { runTask } from "@/lib/ai/tasks";
import { stripMd } from "@/lib/util";

const words = (s: string) => (s.toLowerCase().match(/[a-z0-9\u0980-\u09ff]{3,}/g) || []).filter((w) => !["what", "how", "the", "and", "you", "your", "does", "can", "for", "with", "are", "this"].includes(w));

/** Built-in assistant: answers from the FAQ / help center, optionally phrased by AI. */
export async function POST(req: Request) {
  if (!rateLimit("chat:" + clientIp(req), 20, 5 * 60_000)) return NextResponse.json({ error: "You're sending messages quickly. Please wait a moment." }, { status: 429 });
  const { question } = await req.json().catch(() => ({}));
  const q = String(question || "").slice(0, 500);
  if (!q.trim()) return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  const s = await getAllSettings();
  const faqs = await getPublished("faqs");
  const qw = new Set(words(q));
  const scored = faqs.map((f) => { const w = words(f.title + " " + (f.data.answer || "")); const hits = w.filter((x) => qw.has(x)).length; return { f, score: hits / Math.max(4, qw.size) }; }).sort((a, b) => b.score - a.score);
  const best = scored[0];
  const links = [{ label: "Contact us", href: s.identity.ctaHref || "/contact" }];
  if (await aiAvailable()) {
    try {
      const kb = scored.slice(0, 6).map(({ f }) => ({ q: f.title, a: stripMd(f.data.answer || "") }));
      const r = await runTask("chat", { question: q, kb });
      return NextResponse.json({ answer: r.data.answer, links });
    } catch {}
  }
  if (best && best.score >= 0.25) return NextResponse.json({ answer: stripMd(best.f.data.answer || ""), links: [{ label: "More answers", href: "/faq" }] });
  return NextResponse.json({ answer: `I couldn't find that in our FAQ. Our team replies ${s.identity.replyTime}.`, links });
}
