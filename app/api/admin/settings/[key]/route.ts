export const dynamic = "force-dynamic";
import { api, requireApi } from "@/lib/auth";
import { getSetting, saveSetting, SETTING_DEFAULTS, type SettingKey } from "@/lib/settings";
import { audit } from "@/lib/content";
import { bust } from "@/lib/entries-admin";
import { normalizeTokens } from "@/lib/themes";

type C = { params: { key: string } };
const EDITOR_KEYS = new Set<string>([]);
export const GET = api(async (_r: Request, { params }: C) => {
  await requireApi(EDITOR_KEYS.has(params.key) ? "editor" : "admin");
  if (!(params.key in SETTING_DEFAULTS)) throw new Error("Unknown setting.");
  const v: any = await getSetting(params.key as SettingKey);
  if (params.key === "ai") v.keys = Object.fromEntries(Object.entries(v.keys).map(([k, x]) => [k, x ? "••••" + String(x).slice(-4) : ""]));
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
  if (params.key === "general") value.trashDays = Math.min(365, Math.max(1, Number(value.trashDays) || 30));
  const saved = await saveSetting(params.key as SettingKey, value);
  await audit(u.email, "update settings", params.key);
  bust();
  return { value: params.key === "ai" ? { ...saved, keys: {} } : saved };
});
void normalizeTokens;
