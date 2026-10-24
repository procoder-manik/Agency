import { cache } from "react";
import { PORTFOLIO } from "./portfolio";
import { memo, clearMemo } from "./memo";
import { headers } from "next/headers";
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
  try { rows = await memo("settings", 10_000, () => db().select().from(schema.settings)); } catch (e) { console.error("[settings] database unavailable:", (e as Error).message); }
  for (const k of Object.keys(SETTING_DEFAULTS) as SettingKey[]) out[k] = merge(SETTING_DEFAULTS[k], rows.find((r) => r.key === k)?.value);
  PORTFOLIO.base = out.portfolio?.base || "work";
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
  clearMemo();
  return merged;
}

/** Fill {name} and %s in a title template. */
export function brandTemplate(tpl: string, name: string) { return (tpl || "%s | {name}").replace(/\{name\}/g, name); }

const isLocalHost = (d: string) => !d || /(^|\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/|$)/i.test(d);
const cleanUrl = (d: string) => { let x = d.trim().replace(/\/+$/, ""); if (!/^https?:\/\//.test(x)) x = "https://" + x; return x; };

/** The origin the visitor is actually on (works on Vercel, custom domains, VPS and localhost). */
function requestOrigin(): string | null {
  try {
    const h = headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0].trim();
    if (!host) return null;
    const proto = (h.get("x-forwarded-proto") || "").split(",")[0].trim() || (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host) ? "http" : "https");
    return `${proto}://${host}`;
  } catch { return null; }
}

/** Canonical base URL. Order: a real domain saved in Site identity, then the domain the request came in on
 *  (so the canonical is never localhost in production), then env settings. */
export function siteUrl(identity: { domain?: string }) {
  const configured = (identity.domain || "").trim();
  if (configured && !isLocalHost(configured)) return cleanUrl(configured);
  const live = requestOrigin();
  if (live) return live;
  const env = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (env && !isLocalHost(env)) return cleanUrl(env);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return cleanUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return cleanUrl(configured || env || "http://localhost:3000");
}

export async function getSettingRow(key: string) {
  const r = await db().select().from(schema.settings).where(eq(schema.settings.key, key)).limit(1);
  return r[0];
}
