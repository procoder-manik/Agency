export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { api, requireApi, HttpError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audit } from "@/lib/content";
import { newSecret, otpauthUri, verifyTotp } from "@/lib/totp";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const U = schema.users;
async function me() {
  const s = await requireApi();
  const [u] = await db().select().from(U).where(eq(U.id, s.uid)).limit(1);
  if (!u) throw new HttpError(404, "User not found.");
  return u;
}

export const GET = api(async () => { const u = await me(); return { enabled: u.totpEnabled }; });

export const POST = api(async (req: Request) => {
  const u = await me();
  if (!rateLimit("2fa:" + u.id + ":" + clientIp(req), 10, 15 * 60_000)) throw new HttpError(429, "Too many attempts. Wait a few minutes.");
  const b = await req.json().catch(() => ({}));
  if (b.action === "start") {
    if (u.totpEnabled) throw new Error("Two-factor authentication is already on.");
    const secret = newSecret();
    await db().update(U).set({ totpSecret: secret, updatedAt: new Date() }).where(eq(U.id, u.id));
    return { secret, uri: otpauthUri(u.email, secret) };
  }
  if (b.action === "enable") {
    if (!u.totpSecret || verifyTotp(u.totpSecret, String(b.code)) === null) throw new Error("That code is not correct. Check the time on your phone and try again.");
    await db().update(U).set({ totpEnabled: true, updatedAt: new Date() }).where(eq(U.id, u.id));
    await audit(u.email, "enable 2FA", `#${u.id}`);
    return { ok: true, enabled: true };
  }
  if (b.action === "disable") {
    if (!(await bcrypt.compare(String(b.password || ""), u.passwordHash))) throw new Error("Your password is not correct.");
    if (u.totpEnabled && verifyTotp(u.totpSecret, String(b.code)) === null) throw new Error("Enter a valid code from your authenticator app.");
    await db().update(U).set({ totpEnabled: false, totpSecret: null, updatedAt: new Date() }).where(eq(U.id, u.id));
    await audit(u.email, "disable 2FA", `#${u.id}`);
    return { ok: true, enabled: false };
  }
  throw new Error("Unknown action.");
});
