/** Design-token module: the single source of truth for every colour, font, radius, texture and motion value.
 *  Read by the root layout (CSS variables), Tailwind (via the variables), the OG image renderer and the admin theme builder. */

export const COLOR_TOKENS = [
  ["bg", "Background"], ["surface", "Surface"], ["raised", "Raised surface"], ["line", "Border / line"],
  ["fg", "Primary text"], ["fg2", "Secondary text"], ["muted", "Muted text"],
  ["accent", "Accent"], ["accent2", "Accent (gradient pair)"], ["onaccent", "Text on accent"],
  ["success", "Success"], ["warning", "Warning"], ["danger", "Danger"],
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number][0];

export type Radius = "sharp" | "soft" | "pill";
export type Texture = "none" | "grid" | "dots" | "noise" | "aurora";
export type Motion = "minimal" | "standard" | "playful";

export interface ThemeTokens {
  mode: "dark" | "light";
  colors: Record<ColorToken, string>;
  fonts: { display: string; body: string; mono: string };
  radius: Radius;
  texture: Texture;
  motion: Motion;
}
export interface Theme { slug: string; name: string; builtin: boolean; tokens: ThemeTokens; id?: number }

export const FONT_WEIGHTS: Record<string, string> = {
  "Space Grotesk": "400;500;600;700", "IBM Plex Sans": "400;500;600;700", "IBM Plex Mono": "400;500",
  "Nunito": "400;600;700;800", "Nunito Sans": "400;600;700", "JetBrains Mono": "400;500",
  "Syne": "400;600;700;800", "DM Sans": "400;500;700", "DM Mono": "400;500",
  "Fraunces": "400;600;700", "Outfit": "400;500;600;700", "Space Mono": "400;700",
  "Inter Tight": "400;500;600;700", "Manrope": "400;500;700;800", "Sora": "400;600;700",
  "Bricolage Grotesque": "400;600;700;800", "Unbounded": "400;600;700", "Instrument Serif": "400",
  "Instrument Sans": "400;500;600;700", "Plus Jakarta Sans": "400;600;700", "Archivo": "400;600;700;800",
  "Lexend": "400;600;700", "Familjen Grotesk": "400;600;700", "Red Hat Mono": "400;500",
};
export const CURATED_FONTS = Object.keys(FONT_WEIGHTS);

export const PRESETS: Theme[] = [
  { slug: "signal", name: "Signal", builtin: true, tokens: {
    mode: "dark", radius: "soft", texture: "grid", motion: "standard",
    fonts: { display: "Space Grotesk", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
    colors: { bg: "#07101F", surface: "#0C1A30", raised: "#12243F", line: "#1E3456", fg: "#EAF2FF", fg2: "#B5C6E0", muted: "#7F93B3",
      accent: "#3D8BFF", accent2: "#22D3EE", onaccent: "#04101F", success: "#34D399", warning: "#FBBF24", danger: "#F87171" } } },
  { slug: "nebula", name: "Nebula", builtin: true, tokens: {
    mode: "dark", radius: "pill", texture: "aurora", motion: "playful",
    fonts: { display: "Nunito", body: "Nunito Sans", mono: "JetBrains Mono" },
    colors: { bg: "#0A0612", surface: "#140C22", raised: "#1D1230", line: "#2E1F48", fg: "#F6EEFF", fg2: "#CDBDE6", muted: "#9584B3",
      accent: "#B266FF", accent2: "#FF4FB8", onaccent: "#10051C", success: "#4ADE80", warning: "#FACC15", danger: "#FB7185" } } },
  { slug: "emerald", name: "Emerald", builtin: true, tokens: {
    mode: "dark", radius: "sharp", texture: "dots", motion: "standard",
    fonts: { display: "Syne", body: "DM Sans", mono: "DM Mono" },
    colors: { bg: "#0F1412", surface: "#161D1A", raised: "#1D2622", line: "#2A3832", fg: "#E8F5EF", fg2: "#B3CABF", muted: "#7E978B",
      accent: "#19C9A7", accent2: "#7BE07A", onaccent: "#04130F", success: "#4ADE80", warning: "#F5B83D", danger: "#F26D6D" } } },
  { slug: "sunrise", name: "Sunrise", builtin: true, tokens: {
    mode: "light", radius: "soft", texture: "none", motion: "minimal",
    fonts: { display: "Fraunces", body: "Outfit", mono: "Space Mono" },
    colors: { bg: "#FFF9F2", surface: "#FFFFFF", raised: "#FFF1E3", line: "#F1DCC6", fg: "#2A1A10", fg2: "#5B4334", muted: "#8A7060",
      accent: "#C2410C", accent2: "#E11D74", onaccent: "#FFFFFF", success: "#15803D", warning: "#B45309", danger: "#B91C1C" } } },
  { slug: "mono", name: "Mono", builtin: true, tokens: {
    mode: "dark", radius: "sharp", texture: "noise", motion: "minimal",
    fonts: { display: "Space Mono", body: "Inter Tight", mono: "Space Mono" },
    colors: { bg: "#131313", surface: "#1A1A1A", raised: "#222222", line: "#333333", fg: "#F2F2F2", fg2: "#BDBDBD", muted: "#8C8C8C",
      accent: "#F5D90A", accent2: "#F5D90A", onaccent: "#131313", success: "#9BE38B", warning: "#F5D90A", danger: "#FF8A80" } } },
  { slug: "paper", name: "Paper", builtin: true, tokens: {
    mode: "light", radius: "sharp", texture: "grid", motion: "standard",
    fonts: { display: "Bricolage Grotesque", body: "Instrument Sans", mono: "Red Hat Mono" },
    colors: { bg: "#F5F7FA", surface: "#FFFFFF", raised: "#EDF1F6", line: "#D7DEE8", fg: "#0E1726", fg2: "#3A4759", muted: "#677489",
      accent: "#1D4ED8", accent2: "#0EA5E9", onaccent: "#FFFFFF", success: "#15803D", warning: "#A16207", danger: "#B91C1C" } } },
];

export const DEFAULT_THEME = PRESETS[0];

export function hexToRgb(hex: string): [number, number, number] {
  let h = (hex || "#000").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum([r, g, b]: [number, number, number]) {
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: string, b: string) {
  const [x, y] = [lum(hexToRgb(a)), lum(hexToRgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
/** WCAG AA checks the theme builder shows live. */
export function contrastReport(t: ThemeTokens) {
  const c = t.colors;
  const pairs: [string, string, string, number][] = [
    ["Primary text on background", c.fg, c.bg, 4.5], ["Primary text on surface", c.fg, c.surface, 4.5],
    ["Secondary text on background", c.fg2, c.bg, 4.5], ["Muted text on background", c.muted, c.bg, 3],
    ["Text on accent buttons", c.onaccent, c.accent, 4.5], ["Accent links on background", c.accent, c.bg, 3],
  ];
  return pairs.map(([label, f, b, min]) => ({ label, ratio: contrast(f, b), min, pass: contrast(f, b) >= min }));
}

const RADII: Record<Radius, [string, string, string, string, string]> = {
  sharp: ["2px", "4px", "6px", "8px", "4px"], soft: ["8px", "14px", "20px", "28px", "12px"], pill: ["10px", "18px", "26px", "36px", "999px"],
};
const MOTION: Record<Motion, [string, string]> = { minimal: ["0.4", "0.35s"], standard: ["1", "0.7s"], playful: ["1.6", "0.9s"] };

const stack = (f: string, kind: "sans" | "mono") =>
  `'${f.replace(/'/g, "")}', ${kind === "mono" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"}`;

export function themeCss(t: ThemeTokens, selector = ":root") {
  const vars: string[] = [];
  for (const [k] of COLOR_TOKENS) vars.push(`--c-${k}:${hexToRgb(t.colors[k]).join(" ")}`);
  const r = RADII[t.radius] || RADII.soft;
  const m = MOTION[t.motion] || MOTION.standard;
  vars.push(`--font-display:${stack(t.fonts.display, "sans")}`, `--font-body:${stack(t.fonts.body, "sans")}`, `--font-mono:${stack(t.fonts.mono, "mono")}`,
    `--r-sm:${r[0]}`, `--r-md:${r[1]}`, `--r-lg:${r[2]}`, `--r-xl:${r[3]}`, `--r-btn:${r[4]}`,
    `--motion:${m[0]}`, `--dur:${m[1]}`, `color-scheme:${t.mode}`);
  return `${selector}{${vars.join(";")}}`;
}

export function fontHref(family: string) {
  const w = FONT_WEIGHTS[family] || "400;700";
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${w}&display=swap`;
}
export function themeFontHrefs(t: ThemeTokens) {
  return Array.from(new Set([t.fonts.display, t.fonts.body, t.fonts.mono])).filter(Boolean).map(fontHref);
}

export function normalizeTokens(input: any): ThemeTokens {
  const base = DEFAULT_THEME.tokens;
  const t = input || {};
  const colors = { ...base.colors };
  for (const [k] of COLOR_TOKENS) if (typeof t.colors?.[k] === "string" && /^#[0-9a-f]{3,8}$/i.test(t.colors[k])) colors[k] = t.colors[k];
  const clean = (s: any, d: string) => (typeof s === "string" && /^[\w\s-]{2,60}$/.test(s) ? s.trim() : d);
  return {
    mode: t.mode === "light" ? "light" : "dark",
    colors,
    fonts: { display: clean(t.fonts?.display, base.fonts.display), body: clean(t.fonts?.body, base.fonts.body), mono: clean(t.fonts?.mono, base.fonts.mono) },
    radius: ["sharp", "soft", "pill"].includes(t.radius) ? t.radius : base.radius,
    texture: ["none", "grid", "dots", "noise", "aurora"].includes(t.texture) ? t.texture : base.texture,
    motion: ["minimal", "standard", "playful"].includes(t.motion) ? t.motion : base.motion,
  };
}
