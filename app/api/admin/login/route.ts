export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { COOKIE, signSession } from "@/lib/jwt";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit("login:" + clientIp(req), 10, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts. Wait 15 minutes and try again." }, { status: 429 });
  const { email, password } = await req.json().catch(() => ({}));
  const [u] = await db().select().from(schema.users).where(and(eq(schema.users.email, String(email || "").toLowerCase().trim()), isNull(schema.users.deletedAt))).limit(1);
  if (!u || !(await bcrypt.compare(String(password || ""), u.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  const token = await signSession({ uid: u.id, email: u.email, name: u.name, role: u.role === "admin" ? "admin" : "editor" });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: req.headers.get("x-forwarded-proto") === "https" || new URL(req.url).protocol === "https:", path: "/", maxAge: 7 * 86400 });
  return res;
}
