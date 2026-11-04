import { createHmac, randomBytes, createHash } from "node:crypto";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newSecret() {
  const b = randomBytes(20); let bits = "", out = "";
  for (const x of b) bits += x.toString(2).padStart(8, "0");
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}
function decode(s: string) {
  let bits = ""; for (const c of s.replace(/=+$/, "").toUpperCase()) { const v = B32.indexOf(c); if (v < 0) continue; bits += v.toString(2).padStart(5, "0"); }
  const bytes: number[] = []; for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function code(secret: string, step: number) {
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(step));
  const h = createHmac("sha1", decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}
/** Accepts the current 30-second code and one step either side (clock drift). Returns the matched step or null. */
export function verifyTotp(secret: string | null | undefined, token: string): number | null {
  const t = String(token || "").replace(/\s+/g, "");
  if (!secret || !/^\d{6}$/.test(t)) return null;
  const now = Math.floor(Date.now() / 30000);
  for (const d of [0, -1, 1]) if (code(secret, now + d) === t) return now + d;
  return null;
}
export const otpauthUri = (email: string, secret: string, issuer = "Agency Admin") =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;

/** Short fingerprint of the password hash: stored in the session so changing the password signs every old session out. */
export const pwVersion = (hash: string) => createHash("sha256").update(hash).digest("hex").slice(0, 16);
