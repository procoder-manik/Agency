export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { getSetting, saveSetting, SETTING_DEFAULTS, type SettingKey } from "@/lib/settings";
import { audit } from "@/lib/content";
import { bust } from "@/lib/entries-admin";
import { normalizeTokens } from "@/lib/themes";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isValidBase } from "@/lib/permalinks";
import { sanitizeInline, toRichHtml } from "@/lib/rich";

type C = { params: { key: string } };
const EDITOR_KEYS = new Set<string>(["portfolio"]); // read-only for editors (the category list in the project editor)
const SECRETS = ["callmebotKey", "twilioToken"];
export const GET = api(async (_r: Request, { params }: C) => {
  await requireApi(EDITOR_KEYS.has(params.key) ? "editor" : "admin");
  if (!(params.key in SETTING_DEFAULTS)) throw new Error("Unknown setting.");
  const v: any = await getSetting(params.key as SettingKey);
  if (params.key === "ai") v.keys = Object.fromEntries(Object.entries(v.keys).map(([k, x]) => [k, x ? "••••" + String(x).slice(-4) : ""]));
  if (params.key === "notify") for (const k of SECRETS) if (v[k]) v[k] = "••••" + String(v[k]).slice(-4);
  return { value: v };
});
export const PUT = api(async (req: Request, { params }: C) => {
  const u = await requireApi("admin");
  if (!(params.key in SETTING_DEFAULTS)) throw new Error("Unknown setting.");
  const body = await req.json();
  let value = body.value;
  if (params.key === "ai") { // keep existing keys when the masked value is sent back
    const cur: any = await getSetting("ai");
    value = { ...value, keys: Object.fromEntries(Object.keys(cur.keys).map((k) => [k, String(value.keys?.[k] ?? "").startsWith("••••") ? cur.keys[k] : String(value.keys?.[k] || "").trim()])) };
  }
  if (params.key === "notify") { const cur: any = await getSetting("notify"); value = { ...value }; for (const k of SECRETS) if (String(value[k] ?? "").startsWith("••••")) value[k] = cur[k]; }
  if (params.key === "portfolio") {
    const cur: any = await getSetting("portfolio");
    const base = String(value.base || "work").trim().toLowerCase().replace(/^\/+|\/+$/g, "");
    if (!isValidBase(base)) throw new Error("URL name: use lowercase letters, numbers and hyphens only, and not a name the site already uses (blog, services, contact, and so on).");
    const cats = (Array.isArray(value.categories) ? value.categories : Array.isArray(cur.categories) ? cur.categories : []).map((c: any) => ({ name: String(c?.name || "").trim().slice(0, 40), color: /^#[0-9a-f]{6}$/i.test(String(c?.color || "")) ? String(c.color) : "#3B82F6" })).filter((c: any) => c.name).slice(0, 20);
    value = { label: String(value.label || "Work").trim().slice(0, 40) || "Work", base, categories: cats };
    if (base !== cur.base) { // the listing page (a normal page) moves to the new address; old links redirect
      const P = schema.entries;
      const [clash] = await db().select({ id: P.id }).from(P).where(and(eq(P.collection, "pages"), eq(P.slug, base), isNull(P.deletedAt))).limit(1);
      if (clash) throw new Error(`A page called "${base}" already exists. Rename or delete that page first, or pick another URL name.`);
      await db().update(P).set({ slug: base, updatedAt: new Date() }).where(and(eq(P.collection, "pages"), eq(P.slug, cur.base), isNull(P.deletedAt)));
    }
  }
  if (params.key === "permalinks") {
    const cur: any = await getSetting("permalinks"); const port: any = await getSetting("portfolio");
    const next: Record<string, string> = {};
    for (const k of ["posts", "services", "caseStudies"]) {
      const b = String(value[k] || cur[k]).trim().toLowerCase().replace(/^\/+|\/+$/g, "");
      if (!isValidBase(b)) throw new Error(`"${b}" cannot be used as an address name. Use lowercase letters, numbers and hyphens, and not a name the site already uses.`);
      next[k] = b;
    }
    const all = [next.posts, next.services, next.caseStudies, port.base];
    if (new Set(all).size !== all.length) throw new Error("Each content type needs its own address name.");
    const P = schema.entries;
    for (const k of ["posts", "services", "caseStudies"]) {
      if (next[k] === cur[k]) continue; // the list page (a normal page) moves to the new address; item addresses follow automatically
      const [clash] = await db().select({ id: P.id }).from(P).where(and(eq(P.collection, "pages"), eq(P.slug, next[k]), isNull(P.deletedAt))).limit(1);
      if (clash) throw new Error(`A page called "${next[k]}" already exists. Rename or delete it first, or pick another name.`);
      await db().update(P).set({ slug: next[k], updatedAt: new Date() }).where(and(eq(P.collection, "pages"), eq(P.slug, cur[k]), isNull(P.deletedAt)));
    }
    value = next;
  }
  if (params.key === "footer") for (const k of ["heading", "address", "hours", "copyrightText", "note"]) if (typeof value[k] === "string") value[k] = sanitizeInline(toRichHtml(value[k]));
  if (params.key === "general") value.trashDays = Math.min(365, Math.max(1, Number(value.trashDays) || 30));
  const saved = await saveSetting(params.key as SettingKey, value);
  await audit(u.email, "update settings", params.key);
  bust();
  const out: any = params.key === "ai" ? { ...saved, keys: {} } : { ...saved };
  if (params.key === "notify") for (const k of SECRETS) if (out[k]) out[k] = "••••" + String(out[k]).slice(-4);
  return { value: out };
});
void normalizeTokens;
