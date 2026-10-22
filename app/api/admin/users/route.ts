export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { asc, eq } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audit } from "@/lib/content";

const U = schema.users;
export const GET = api(async () => { await requireApi("admin"); return { items: await db().select({ id: U.id, email: U.email, name: U.name, role: U.role, createdAt: U.createdAt, deletedAt: U.deletedAt }).from(U).orderBy(asc(U.id)) }; });
export const POST = api(async (req: Request) => {
  const me = await requireApi("admin"); const b = await req.json();
  const email = String(b.email || "").toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  if (String(b.password || "").length < 10) throw new Error("Passwords need at least 10 characters.");
  await db().insert(U).values({ email, name: String(b.name || ""), role: b.role === "admin" ? "admin" : "editor", passwordHash: await bcrypt.hash(String(b.password), 12) });
  await audit(me.email, "add user", email); return { ok: true };
});
export const PUT = api(async (req: Request) => {
  const me = await requireApi(); const b = await req.json(); const id = Number(b.id);
  if (me.role !== "admin" && id !== me.uid) throw new Error("You can only change your own account.");
  const patch: any = { updatedAt: new Date() };
  if (b.name !== undefined) patch.name = String(b.name);
  if (b.role && me.role === "admin" && id !== me.uid) patch.role = b.role === "admin" ? "admin" : "editor";
  if (b.password) { if (String(b.password).length < 10) throw new Error("Passwords need at least 10 characters."); patch.passwordHash = await bcrypt.hash(String(b.password), 12); }
  if (b.disabled !== undefined && me.role === "admin" && id !== me.uid) patch.deletedAt = b.disabled ? new Date() : null;
  await db().update(U).set(patch).where(eq(U.id, id)); await audit(me.email, "update user", `#${id}`); return { ok: true };
});
