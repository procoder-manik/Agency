import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { getAllSettings } from "@/lib/settings";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { esc, sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit("chatlead:" + clientIp(req), 4, 10 * 60_000)) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (b._hp) return NextResponse.json({ ok: true });
  const name = String(b.name || "").trim().slice(0, 120), email = String(b.email || "").trim().slice(0, 200), message = String(b.message || "").trim().slice(0, 2000);
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  const transcript = (Array.isArray(b.transcript) ? b.transcript : []).slice(-16).map((m: any) => `${m?.role === "assistant" ? "Bot" : "Visitor"}: ${String(m?.content || "").slice(0, 500)}`).join("\n");
  const [sub] = await db().insert(schema.submissions).values({ formName: "Chat", values: { name, email, message, transcript } }).returning();
  await db().insert(schema.leads).values({ name, email, source: "Chat", notes: `${message}${transcript ? `\n\nChat transcript:\n${transcript}` : ""}`, submissionId: sub.id });
  const s = await getAllSettings();
  await sendMail(s.general.notifyEmail || s.identity.email, `New chat lead on ${s.identity.name}`, `${name} <${email}>\n\n${message}\n\n${transcript}`,
    `<h2>New chat lead</h2><p><b>${esc(name)}</b> &lt;${esc(email)}&gt;</p><p>${esc(message).replace(/\n/g, "<br>")}</p><pre style="white-space:pre-wrap">${esc(transcript)}</pre>`);
  return NextResponse.json({ ok: true });
}
