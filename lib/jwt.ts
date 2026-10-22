import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "agency_session";
export type Role = "admin" | "editor";
export interface Session { uid: number; email: string; name: string; role: Role }

const key = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-insecure-secret-change-me");

export async function signSession(s: Session) {
  return new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key());
}
export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { uid: Number(payload.uid), email: String(payload.email), name: String(payload.name || ""), role: payload.role === "admin" ? "admin" : "editor" };
  } catch { return null; }
}
