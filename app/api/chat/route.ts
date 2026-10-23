import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { chatReply, type ChatMsg } from "@/lib/chat/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!rateLimit("chat:" + clientIp(req), 30, 5 * 60_000)) return NextResponse.json({ error: "You're sending messages quickly. Please wait a moment." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const raw: any[] = Array.isArray(body.messages) ? body.messages : body.question ? [{ role: "user", content: body.question }] : [];
  const messages: ChatMsg[] = raw.slice(-10).map((m) => ({ role: (m?.role === "assistant" ? "assistant" : "user") as ChatMsg["role"], content: String(m?.content || "").slice(0, 800) })).filter((m) => m.content.trim());
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  try { return NextResponse.json(await chatReply(messages)); }
  catch (e) { console.error("[chat]", e); return NextResponse.json({ error: "Something went wrong on our side. Please try again or use the contact page." }, { status: 500 }); }
}
