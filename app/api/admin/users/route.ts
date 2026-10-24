export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { HttpError } from "@/lib/auth";
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
  try { await db().insert(U).values({ email, name: String(b.name || ""), role: b.role === "admin" ? "admin" : "editor", passwordHash: await bcrypt.hash(String(b.password), 12) }); }
  catch (e: any) { if (e?.code === "23505" || /duplicate key/i.test(e?.message || "")) throw new Error("A user with this email already exists."); throw e; }
  await audit(me.email, "add user", email); return { ok: true };
});
export const PUT = api(async (req: Request) => {
  const me = await requireApi(); const b = await req.json(); const id = Number(b.id);
  if (me.role !== "admin" && id !== me.uid) throw new Error("You can only change your own account.");
  const patch: any = { updatedAt: new Date() };
  const [target] = await db().select().from(U).where(eq(U.id, id)).limit(1);
  if (!target) throw new HttpError(404, "User not found.");
  let emailChanged = false;
  if (b.name !== undefined) patch.name = String(b.name).slice(0, 120);
  if (b.email !== undefined && String(b.email).toLowerCase().trim() !== target.email) {
    const email = String(b.email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
    if (id === me.uid && !(await bcrypt.compare(String(b.currentPassword || ""), target.passwordHash))) throw new Error("Enter your current password to change your email.");
    patch.email = email; emailChanged = true;
  }
  if (b.role && me.role === "admin" && id !== me.uid) patch.role = b.role === "admin" ? "admin" : "editor";
  if (b.password) { if (String(b.password).length < 10) throw new Error("Passwords need at least 10 characters."); patch.passwordHash = await bcrypt.hash(String(b.password), 12); }
  if (b.disabled !== undefined && me.role === "admin" && id !== me.uid) patch.deletedAt = b.disabled ? new Date() : null;
  try { await db().update(U).set(patch).where(eq(U.id, id)); }
  catch (e: any) { if (e?.code === "23505" || /duplicate key/i.test(e?.message || "")) throw new Error("Another user already uses this email."); throw e; }
  await audit(me.email, "update user", `#${id}`); return { ok: true, relogin: emailChanged && id === me.uid };
});
