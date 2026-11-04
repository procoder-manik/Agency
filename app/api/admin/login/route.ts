export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { COOKIE, signSession } from "@/lib/jwt";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { pwVersion, verifyTotp } from "@/lib/totp";

export async function POST(req: Request) {
  if (!rateLimit("login:" + clientIp(req), 10, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts. Wait 15 minutes and try again." }, { status: 429 });
  const { email, password, code } = await req.json().catch(() => ({}));
  const [u] = await db().select().from(schema.users).where(and(eq(schema.users.email, String(email || "").toLowerCase().trim()), isNull(schema.users.deletedAt))).limit(1);
  // Always run one bcrypt comparison so response time doesn't reveal whether an email exists.
  const ok = await bcrypt.compare(String(password || "").slice(0, 200), u?.passwordHash || "$2a$12$M3uEHfZwDuWON3UFHkgJk.WPpGefIm4aBk2j4y3XmNRVBuGuoSjZG");
  if (!u || !ok) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  if (u.totpEnabled) {
    if (!String(code || "").trim()) return NextResponse.json({ twofa: true });
    if (verifyTotp(u.totpSecret, String(code)) === null) return NextResponse.json({ error: "That code is not correct or has expired.", twofa: true }, { status: 401 });
  }
  const token = await signSession({ uid: u.id, email: u.email, name: u.name, role: u.role === "admin" ? "admin" : "editor", pv: pwVersion(u.passwordHash) });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: req.headers.get("x-forwarded-proto") === "https" || new URL(req.url).protocol === "https:", path: "/", maxAge: 7 * 86400 });
  return res;
}
