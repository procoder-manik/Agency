import { cache } from "react";
import { asc, eq, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import { DEFAULT_THEME, PRESETS, normalizeTokens, type Theme } from "./themes";
import { getSetting } from "./settings";

export const listThemes = cache(async (): Promise<Theme[]> => {
  try {
    const rows = await db().select().from(schema.themes).where(isNull(schema.themes.deletedAt)).orderBy(asc(schema.themes.builtin), asc(schema.themes.id));
    if (!rows.length) return PRESETS;
    const list = rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, builtin: r.builtin, tokens: normalizeTokens(r.builtin ? PRESETS.find((p) => p.slug === r.slug)?.tokens || r.tokens : r.tokens) }));
    return [...list.filter((t) => t.builtin), ...list.filter((t) => !t.builtin)];
  } catch { return PRESETS; }
});

export const getActiveTheme = cache(async (): Promise<Theme> => {
  const { activeTheme } = await getSetting("appearance");
  const all = await listThemes();
  return all.find((t) => t.slug === activeTheme) || all[0] || DEFAULT_THEME;
});

/** The active theme with any sitewide Buttons and forms override (Admin > Themes) applied on top. */
export const getEffectiveTheme = cache(async (): Promise<Theme> => {
  const [theme, ap] = await Promise.all([getActiveTheme(), getSetting("appearance")]);
  const ov = (ap as any).ui;
  if (!ov || typeof ov !== "object") return theme;
  return { ...theme, tokens: normalizeTokens({ ...theme.tokens, ui: { ...(theme.tokens.ui || {}), ...ov } }) };
});

export async function themeBySlug(slug: string) {
  const r = await db().select().from(schema.themes).where(eq(schema.themes.slug, slug)).limit(1);
  return r[0];
}
