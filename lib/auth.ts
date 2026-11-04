import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import { COOKIE, verifySession, type Role, type Session } from "./jwt";

/** Verifies the cookie, then re-checks the account in the database so disabled users and role changes take effect immediately. */
export async function getSession(): Promise<Session | null> {
  const s = await verifySession(cookies().get(COOKIE)?.value);
  if (!s) return null;
  try {
    const [u] = await db().select({ id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role }).from(schema.users).where(and(eq(schema.users.id, s.uid), isNull(schema.users.deletedAt))).limit(1);
    if (!u) return null;
    return { uid: u.id, email: u.email, name: u.name, role: u.role === "admin" ? "admin" : "editor" };
  } catch { return null; }
}

/** For admin pages: redirect to login (or dashboard if the role is too low). */
export async function requirePage(role: Role = "editor") {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (role === "admin" && s.role !== "admin") redirect("/admin?denied=1");
  return s;
}

export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }

/** For admin API routes. */
export async function requireApi(role: Role = "editor") {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Sign in to continue.");
  if (role === "admin" && s.role !== "admin") throw new HttpError(403, "Only admins can do this.");
  return s;
}

/** Wrap an API handler: JSON errors with proper status codes. */
export function api<T extends any[]>(fn: (...a: T) => Promise<any>) {
  return async (...a: T) => {
    try {
      const out = await fn(...a);
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e: any) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error(e);
      return NextResponse.json({ error: e?.message || "Something went wrong." }, { status });
    }
  };
}
