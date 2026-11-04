import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "agency_session";
export type Role = "admin" | "editor";
export interface Session { uid: number; email: string; name: string; role: Role; pv?: string }

const key = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    // Never fall back to a public default in production: anyone could forge an admin session with it.
    if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET is missing or too short. Set a long random value in your environment variables.");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me");
  }
  return new TextEncoder().encode(secret);
};

export async function signSession(s: Session) {
  return new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key());
}
export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { uid: Number(payload.uid), email: String(payload.email), name: String(payload.name || ""), role: payload.role === "admin" ? "admin" : "editor", pv: payload.pv ? String(payload.pv) : undefined };
  } catch { return null; }
}
