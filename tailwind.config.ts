import type { Config } from "tailwindcss";

// Every colour, font and radius points at a CSS custom property set by the active theme (lib/themes.ts).
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v("bg"), surface: v("surface"), raised: v("raised"), line: v("line"),
        fg: v("fg"), fg2: v("fg2"), muted: v("muted"), accent: v("accent"), accent2: v("accent2"),
        onaccent: v("onaccent"), success: v("success"), warning: v("warning"), danger: v("danger"),
      },
      fontFamily: { display: "var(--font-display)", body: "var(--font-body)", mono: "var(--font-mono)" },
      borderRadius: { sm: "var(--r-sm)", DEFAULT: "var(--r-md)", md: "var(--r-md)", lg: "var(--r-lg)", xl: "var(--r-xl)" },
      transitionTimingFunction: { out: "cubic-bezier(.16,1,.3,1)" },
    },
  },
  plugins: [],
} satisfies Config;
