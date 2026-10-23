import { hash } from "./templating";

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
  mode: "dark" | "light"; // the theme's default mode
  colors: Record<ColorToken, string>; // palette for the default mode
  alt?: Record<ColorToken, string>; // palette for the opposite mode (derived automatically if missing)
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
    colors: { bg: "#060913", surface: "#0B111F", raised: "#121A2D", line: "#1E2A45", fg: "#EAF0FF", fg2: "#A9B6D3", muted: "#7283A6", accent: "#4C8DFF", accent2: "#22E5D0", onaccent: "#04101F", success: "#34D399", warning: "#FBBF24", danger: "#F87171" },
    alt: { bg: "#F5F8FD", surface: "#FFFFFF", raised: "#EBF0F9", line: "#D5DDEC", fg: "#0A1226", fg2: "#38486A", muted: "#5C6B89", accent: "#1E5CF2", accent2: "#0A8FA6", onaccent: "#FFFFFF", success: "#047857", warning: "#A16207", danger: "#B91C1C" } } },
  { slug: "nebula", name: "Nebula", builtin: true, tokens: {
    mode: "dark", radius: "pill", texture: "aurora", motion: "playful",
    fonts: { display: "Nunito", body: "Nunito Sans", mono: "JetBrains Mono" },
    colors: { bg: "#0A0613", surface: "#130D22", raised: "#1B1330", line: "#2C2048", fg: "#F5EEFF", fg2: "#C6B8E2", muted: "#8E7DB0", accent: "#A66BFF", accent2: "#FF5CC0", onaccent: "#12051F", success: "#34D399", warning: "#FBBF24", danger: "#F87171" },
    alt: { bg: "#FAF6FF", surface: "#FFFFFF", raised: "#F2EAFE", line: "#E1D3F6", fg: "#170A2B", fg2: "#46355F", muted: "#675684", accent: "#7C2FE0", accent2: "#C41E78", onaccent: "#FFFFFF", success: "#047857", warning: "#A16207", danger: "#B91C1C" } } },
  { slug: "emerald", name: "Emerald", builtin: true, tokens: {
    mode: "dark", radius: "sharp", texture: "dots", motion: "standard",
    fonts: { display: "Syne", body: "DM Sans", mono: "DM Mono" },
    colors: { bg: "#06110D", surface: "#0D1A15", raised: "#14251F", line: "#1F362D", fg: "#E7F7F0", fg2: "#A8C9BC", muted: "#6F9486", accent: "#1FD1A8", accent2: "#8BE04E", onaccent: "#03130E", success: "#34D399", warning: "#FBBF24", danger: "#F87171" },
    alt: { bg: "#F2F9F6", surface: "#FFFFFF", raised: "#E6F1EC", line: "#CCDFD6", fg: "#0B1A14", fg2: "#32483E", muted: "#586F63", accent: "#08795F", accent2: "#3A8A1E", onaccent: "#FFFFFF", success: "#047857", warning: "#A16207", danger: "#B91C1C" } } },
  { slug: "sunrise", name: "Sunrise", builtin: true, tokens: {
    mode: "light", radius: "soft", texture: "none", motion: "minimal",
    fonts: { display: "Fraunces", body: "Outfit", mono: "Space Mono" },
    colors: { bg: "#FFF8F0", surface: "#FFFFFF", raised: "#FFEEDB", line: "#EFD8BE", fg: "#2A1608", fg2: "#5A4030", muted: "#7E6350", accent: "#C2410C", accent2: "#D1236F", onaccent: "#FFFFFF", success: "#047857", warning: "#A16207", danger: "#B91C1C" },
    alt: { bg: "#140C07", surface: "#1D120B", raised: "#281910", line: "#3B2718", fg: "#FFF1E3", fg2: "#E0C6AF", muted: "#AC8D75", accent: "#FF8A3D", accent2: "#FF5FA2", onaccent: "#1A0C03", success: "#34D399", warning: "#FBBF24", danger: "#F87171" } } },
  { slug: "mono", name: "Mono", builtin: true, tokens: {
    mode: "dark", radius: "sharp", texture: "noise", motion: "minimal",
    fonts: { display: "Space Mono", body: "Inter Tight", mono: "Space Mono" },
    colors: { bg: "#0E0E0E", surface: "#161616", raised: "#1F1F1F", line: "#2E2E2E", fg: "#F4F4F4", fg2: "#BEBEBE", muted: "#8A8A8A", accent: "#F5E50A", accent2: "#FFB800", onaccent: "#0E0E0E", success: "#34D399", warning: "#FBBF24", danger: "#F87171" },
    alt: { bg: "#F4F4F1", surface: "#FFFFFF", raised: "#EAEAE6", line: "#D4D4CE", fg: "#0E0E0E", fg2: "#3C3C3C", muted: "#666666", accent: "#111111", accent2: "#3A3A3A", onaccent: "#F5E50A", success: "#047857", warning: "#A16207", danger: "#B91C1C" } } },
  { slug: "paper", name: "Paper", builtin: true, tokens: {
    mode: "light", radius: "sharp", texture: "grid", motion: "standard",
    fonts: { display: "Bricolage Grotesque", body: "Instrument Sans", mono: "Red Hat Mono" },
    colors: { bg: "#F4F6FA", surface: "#FFFFFF", raised: "#EBEFF5", line: "#D5DCE8", fg: "#0E1726", fg2: "#3A4759", muted: "#627086", accent: "#1D4ED8", accent2: "#0284C7", onaccent: "#FFFFFF", success: "#047857", warning: "#A16207", danger: "#B91C1C" },
    alt: { bg: "#0A101C", surface: "#111A2C", raised: "#18233A", line: "#26344F", fg: "#EEF3FB", fg2: "#B7C3D6", muted: "#8392AA", accent: "#5B8CFF", accent2: "#38BDF8", onaccent: "#06101F", success: "#34D399", warning: "#FBBF24", danger: "#F87171" } } },
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

/* ---------- Deterministic per-category colour (blog categories, tags, etc.) ---------- */
function hexToHsl(hex: string): [number, number, number] {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r0, g0, b0), min = Math.min(r0, g0, b0); const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r0) h = ((g0 - b0) / d) % 6; else if (max === g0) h = (b0 - r0) / d + 2; else h = (r0 - g0) / d + 4;
  h = Math.round(h * 60); if (h < 0) h += 360;
  return [h, Math.round(s * 100), Math.round(l * 100)];
}
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = l - c / 2;
  const [r0, g0, b0] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r0)}${to(g0)}${to(b0)}`;
}
export interface CategoryColors { accent: string; accent2: string; onaccent: string }
/** A distinct, readable colour pair for a category: uses the colour an admin picked, or derives one from the
 *  category's own id/slug so every category still looks different without anyone having to choose a colour. */
export function categoryTheme(seed: string, override?: string): CategoryColors {
  const valid = !!override && /^#[0-9a-f]{3,8}$/i.test(override);
  const [h, s, l] = valid ? hexToHsl(override!) : [hash(seed) % 360, 68, 50];
  const accent = valid ? override! : hslToHex(h, s, l);
  const accent2 = hslToHex((h + 34) % 360, Math.min(92, s + 6), Math.min(70, l + 8));
  const onaccent = contrast("#FFFFFF", accent) >= 4.5 ? "#FFFFFF" : "#0A0A0A";
  return { accent, accent2, onaccent };
}

const RADII: Record<Radius, [string, string, string, string, string]> = {
  sharp: ["2px", "4px", "6px", "8px", "4px"], soft: ["8px", "14px", "20px", "28px", "12px"], pill: ["10px", "18px", "26px", "36px", "999px"],
};
const MOTION: Record<Motion, [string, string]> = { minimal: ["0.4", "0.35s"], standard: ["1", "0.7s"], playful: ["1.6", "0.9s"] };

const stack = (f: string, kind: "sans" | "mono") =>
  `'${f.replace(/'/g, "")}', ${kind === "mono" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"}`;

/** Palette for a given mode: the theme's own colours for its default mode, `alt` (or a derived palette) for the other. */
export function paletteFor(t: ThemeTokens, mode: "dark" | "light"): Record<ColorToken, string> {
  if (mode === t.mode) return t.colors;
  return t.alt || derivePalette(t.colors, mode);
}

function mix(a: string, b: string, w: number) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return "#" + x.map((v, i) => Math.round(v * (1 - w) + y[i] * w).toString(16).padStart(2, "0")).join("");
}
/** Build an opposite-mode palette from one palette, keeping the accent hue and checking contrast. */
export function derivePalette(c: Record<ColorToken, string>, mode: "dark" | "light"): Record<ColorToken, string> {
  const dark = mode === "dark";
  const bg = dark ? mix("#0A0C12", c.accent, 0.06) : mix("#FAFAFC", c.accent, 0.03);
  const fg = dark ? "#EEF1F7" : "#0D111A";
  let accent = c.accent;
  for (let i = 0; i < 10 && contrast(accent, bg) < 3.2; i++) accent = mix(accent, dark ? "#FFFFFF" : "#000000", 0.12);
  let accent2 = c.accent2;
  for (let i = 0; i < 10 && contrast(accent2, bg) < 3; i++) accent2 = mix(accent2, dark ? "#FFFFFF" : "#000000", 0.12);
  return {
    bg, surface: dark ? mix(bg, "#FFFFFF", 0.04) : "#FFFFFF", raised: dark ? mix(bg, "#FFFFFF", 0.08) : mix(bg, "#000000", 0.04),
    line: dark ? mix(bg, "#FFFFFF", 0.14) : mix(bg, "#000000", 0.12), fg, fg2: mix(fg, bg, 0.25), muted: mix(fg, bg, 0.45),
    accent, accent2, onaccent: contrast("#FFFFFF", accent) >= 4.5 ? "#FFFFFF" : "#0A0A0A",
    success: dark ? "#4ADE80" : "#15803D", warning: dark ? "#FBBF24" : "#A16207", danger: dark ? "#F87171" : "#B91C1C",
  };
}

function colorVars(c: Record<ColorToken, string>) {
  return COLOR_TOKENS.map(([k]) => `--c-${k}:${hexToRgb(c[k]).join(" ")}`).join(";");
}

/** CSS for both modes. The <html data-mode> attribute picks one; the visitor toggle flips it. */
export function themeCssBoth(t: ThemeTokens) {
  const other = t.mode === "dark" ? "light" : "dark";
  return `${themeCss(t)}:root[data-mode="${t.mode}"]{${colorVars(t.colors)};color-scheme:${t.mode}}:root[data-mode="${other}"]{${colorVars(paletteFor(t, other))};color-scheme:${other}}${accentCss(t)}`;
}

export function themeCss(t: ThemeTokens, selector = ":root", mode?: "dark" | "light") {
  const vars: string[] = [];
  const pal = paletteFor(t, mode || t.mode);
  for (const [k] of COLOR_TOKENS) vars.push(`--c-${k}:${hexToRgb(pal[k]).join(" ")}`);
  const r = RADII[t.radius] || RADII.soft;
  const m = MOTION[t.motion] || MOTION.standard;
  vars.push(`--font-display:${stack(t.fonts.display, "sans")}`, `--font-body:${stack(t.fonts.body, "sans")}`, `--font-mono:${stack(t.fonts.mono, "mono")}`,
    `--r-sm:${r[0]}`, `--r-md:${r[1]}`, `--r-lg:${r[2]}`, `--r-xl:${r[3]}`, `--r-btn:${r[4]}`,
    `--motion:${m[0]}`, `--dur:${m[1]}`, `color-scheme:${mode || t.mode}`);
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
  const okHex = (v: any) => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v);
  const colors = { ...base.colors };
  for (const [k] of COLOR_TOKENS) if (okHex(t.colors?.[k])) colors[k] = t.colors[k];
  let alt: Record<ColorToken, string> | undefined;
  if (t.alt && typeof t.alt === "object") { alt = { ...derivePalette(colors, t.mode === "light" ? "dark" : "light") }; for (const [k] of COLOR_TOKENS) if (okHex(t.alt[k])) alt[k] = t.alt[k]; }
  const clean = (s: any, d: string) => (typeof s === "string" && /^[\w\s-]{2,60}$/.test(s) ? s.trim() : d);
  return {
    mode: t.mode === "light" ? "light" : "dark",
    colors, ...(alt ? { alt } : {}),
    fonts: { display: clean(t.fonts?.display, base.fonts.display), body: clean(t.fonts?.body, base.fonts.body), mono: clean(t.fonts?.mono, base.fonts.mono) },
    radius: ["sharp", "soft", "pill"].includes(t.radius) ? t.radius : base.radius,
    texture: ["none", "grid", "dots", "noise", "aurora"].includes(t.texture) ? t.texture : base.texture,
    motion: ["minimal", "standard", "playful"].includes(t.motion) ? t.motion : base.motion,
  };
}


/* ---------- Visitor-selectable accent shades ---------- */
export const ACCENTS: { id: string; label: string; a: string; b: string }[] = [
  { id: "azure", label: "Azure", a: "#3D8BFF", b: "#22D3EE" },
  { id: "violet", label: "Violet", a: "#8B5CF6", b: "#EC4899" },
  { id: "emerald", label: "Emerald", a: "#10B981", b: "#84CC16" },
  { id: "sunset", label: "Sunset", a: "#F97316", b: "#EF4444" },
  { id: "rose", label: "Rose", a: "#F43F5E", b: "#FB923C" },
  { id: "aqua", label: "Aqua", a: "#06B6D4", b: "#6366F1" },
  { id: "lime", label: "Lime", a: "#84CC16", b: "#14B8A6" },
  { id: "gold", label: "Gold", a: "#EAB308", b: "#F97316" },
  { id: "graphite", label: "Graphite", a: "#9CA3AF", b: "#E5E7EB" },
];

function fitToBg(hex: string, bg: string, mode: "dark" | "light", min = 3.4) {
  let c = hex;
  for (let i = 0; i < 14 && contrast(c, bg) < min; i++) c = mix(c, mode === "dark" ? "#FFFFFF" : "#000000", 0.1);
  return c;
}

/** CSS that re-points the accent for each visitor-chosen shade, once per mode, contrast-checked against that mode's background. */
export function accentCss(t: ThemeTokens) {
  let css = "";
  for (const mode of ["dark", "light"] as const) {
    const pal = paletteFor(t, mode);
    for (const ac of ACCENTS) {
      let a = fitToBg(ac.a, pal.bg, mode), b = fitToBg(ac.b, pal.bg, mode, 3);
      if (ac.id === "graphite") { a = mode === "dark" ? "#E5E7EB" : "#1F2937"; b = mode === "dark" ? "#9CA3AF" : "#4B5563"; }
      const on = contrast("#FFFFFF", a) >= 4.5 ? "#FFFFFF" : contrast("#0A0A0A", a) >= 4.5 ? "#0A0A0A" : (contrast("#FFFFFF", a) > contrast("#0A0A0A", a) ? "#FFFFFF" : "#0A0A0A");
      css += `:root[data-accent="${ac.id}"][data-mode="${mode}"]{--c-accent:${hexToRgb(a).join(" ")};--c-accent2:${hexToRgb(b).join(" ")};--c-onaccent:${hexToRgb(on).join(" ")}}`;
    }
  }
  return css;
}
