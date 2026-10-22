export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
import { api, requireApi } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audit } from "@/lib/content";
import { bust } from "@/lib/entries-admin";
import { listThemes } from "@/lib/theme-server";
import { getSetting, saveSetting } from "@/lib/settings";
import { normalizeTokens } from "@/lib/themes";
import { slugify } from "@/lib/util";

export const GET = api(async () => { await requireApi(); return { themes: await listThemes(), active: (await getSetting("appearance")).activeTheme }; });

export const POST = api(async (req: Request) => {
  const u = await requireApi("admin");
  const b = await req.json();
  const T = schema.themes;
  if (b.action === "activate") {
    const [t] = await db().select().from(T).where(eq(T.slug, String(b.slug))).limit(1);
    if (!t || t.deletedAt) throw new Error("Theme not found.");
    await saveSetting("appearance", { activeTheme: t.slug }); await audit(u.email, "activate theme", t.name); bust();
    return { ok: true };
  }
  if (b.action === "save") { // create or update a custom theme
    const tokens = normalizeTokens(b.tokens);
    const name = String(b.name || "Custom theme").slice(0, 60);
    if (b.slug) {
      const [t] = await db().select().from(T).where(eq(T.slug, String(b.slug))).limit(1);
      if (t && !t.builtin) { await db().update(T).set({ name, tokens, updatedAt: new Date() }).where(eq(T.id, t.id)); await audit(u.email, "update theme", name); bust(); return { slug: t.slug }; }
    }
    let slug = slugify(name) || "custom"; let n = 1;
    while ((await db().select({ id: T.id }).from(T).where(eq(T.slug, slug)).limit(1))[0]) slug = `${slugify(name) || "custom"}-${++n}`;
    await db().insert(T).values({ slug, name, builtin: false, tokens });
    await audit(u.email, "create theme", name); bust();
    return { slug };
  }
  if (b.action === "delete") {
    const [t] = await db().select().from(T).where(eq(T.slug, String(b.slug))).limit(1);
    if (!t || t.builtin) throw new Error("Built-in themes can't be deleted.");
    if ((await getSetting("appearance")).activeTheme === t.slug) throw new Error("Switch to another theme before deleting this one.");
    await db().delete(T).where(eq(T.id, t.id)); await audit(u.email, "delete theme", t.name);
    return { ok: true };
  }
  throw new Error("Unknown action.");
});
