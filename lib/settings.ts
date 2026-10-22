import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";

import { SETTING_DEFAULTS, type SettingKey, type Settings } from "./settings-defaults";
export { SETTING_DEFAULTS, type SettingKey, type Settings };

function merge(def: any, val: any): any {
  if (Array.isArray(def)) return Array.isArray(val) ? val : def;
  if (def && typeof def === "object") {
    const out: any = { ...def };
    for (const k of Object.keys(val || {})) out[k] = k in def ? merge(def[k], val[k]) : val[k];
    return out;
  }
  return val === undefined || val === null ? def : val;
}

export const getAllSettings = cache(async (): Promise<Settings> => {
  const out: any = {};
  let rows: { key: string; value: any }[] = [];
  try { rows = await db().select().from(schema.settings); } catch (e) { console.error("[settings] database unavailable:", (e as Error).message); }
  for (const k of Object.keys(SETTING_DEFAULTS) as SettingKey[]) out[k] = merge(SETTING_DEFAULTS[k], rows.find((r) => r.key === k)?.value);
  return out;
});

export async function getSetting<K extends SettingKey>(k: K): Promise<Settings[K]> {
  return (await getAllSettings())[k];
}

export async function saveSetting(key: SettingKey, value: any) {
  const [row] = await db().select().from(schema.settings).where(eq(schema.settings.key, key)).limit(1);
  const merged = merge(merge(SETTING_DEFAULTS[key], row?.value), value);
  await db().insert(schema.settings).values({ key, value: merged })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: merged, updatedAt: new Date() } });
  return merged;
}

/** Fill {name} and %s in a title template. */
export function brandTemplate(tpl: string, name: string) { return (tpl || "%s | {name}").replace(/\{name\}/g, name); }

export function siteUrl(identity: { domain?: string }) {
  let d = (identity.domain || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim().replace(/\/+$/, "");
  if (!/^https?:\/\//.test(d)) d = "https://" + d;
  return d;
}

export async function getSettingRow(key: string) {
  const r = await db().select().from(schema.settings).where(eq(schema.settings.key, key)).limit(1);
  return r[0];
}
