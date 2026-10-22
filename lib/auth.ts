import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { COOKIE, verifySession, type Role, type Session } from "./jwt";

export async function getSession(): Promise<Session | null> {
  return verifySession(cookies().get(COOKIE)?.value);
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
