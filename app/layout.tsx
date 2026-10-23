import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getActiveTheme } from "@/lib/theme-server";
import { getAllSettings, siteUrl } from "@/lib/settings";
import { paletteFor, themeCssBoth, themeFontHrefs } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  return {
    metadataBase: new URL(siteUrl(s.identity)),
    title: s.identity.name,
    description: s.identity.description,
    icons: { icon: [{ url: "/api/logo?v=" + encodeURIComponent(s.identity.shortName + s.identity.logo), type: "image/svg+xml" }] },
    applicationName: s.identity.name,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const t = (await getActiveTheme()).tokens;
  return {
    width: "device-width", initialScale: 1, colorScheme: "dark light",
    themeColor: [{ media: "(prefers-color-scheme: dark)", color: paletteFor(t, "dark").bg }, { media: "(prefers-color-scheme: light)", color: paletteFor(t, "light").bg }],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, s] = await Promise.all([getActiveTheme(), getAllSettings()]);
  const t = theme.tokens; const ap = s.appearance as any;
  // Runs before first paint so there is no flash. Order: visitor's saved choice, then the admin default.
  // Preference is one of system | light | dark; "system" follows the device and updates live.
  const def = ap.defaultMode === "dark" || ap.defaultMode === "light" ? ap.defaultMode : ap.defaultMode === "theme" ? t.mode : "system";
  const boot = `(function(){try{var d=document.documentElement,p=${ap.modeToggle ? "localStorage.getItem('mode')" : "null"};if(p!=='system'&&p!=='light'&&p!=='dark'){p='${def}'}var m=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;d.dataset.pref=p;d.dataset.mode=m;d.classList.toggle('dark',m==='dark');${ap.accentPicker ? "var a=localStorage.getItem('accent');if(a&&/^[a-z0-9-]+$/.test(a))d.dataset.accent=a;" : ""}}catch(e){}})()`;
  return (
    <html lang="en" data-mode={t.mode} data-texture={t.texture} data-motion={t.motion} data-theme={theme.slug} className={t.mode === "dark" ? "dark" : ""} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {themeFontHrefs(t).map((h) => <link key={h} rel="stylesheet" href={h} />)}
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: themeCssBoth(t) }} />
        <noscript><style>{".reveal,.fade-in,.word>span,.split .word>span{opacity:1!important;transform:none!important;animation:none!important;filter:none!important}.clip{clip-path:none!important}.clip>.clip-inner{transform:none!important}.intro{display:none!important}"}</style></noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
