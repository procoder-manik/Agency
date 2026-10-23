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
  // Runs before paint so there's no flash: visitor's saved choice, then system preference (if enabled), then the theme default.
  const boot = `(function(){try{var d=document.documentElement,m=null;${ap.modeToggle ? "m=localStorage.getItem('mode');" : ""}if(m!=='dark'&&m!=='light'){${ap.defaultMode === "system" ? "m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';" : ap.defaultMode === "dark" || ap.defaultMode === "light" ? `m='${ap.defaultMode}';` : `m='${t.mode}';`}}d.dataset.mode=m;d.classList.toggle('dark',m==='dark')}catch(e){}})()`;
  return (
    <html lang="en" data-mode={t.mode} data-texture={t.texture} data-motion={t.motion} data-theme={theme.slug} className={t.mode === "dark" ? "dark" : ""} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {themeFontHrefs(t).map((h) => <link key={h} rel="stylesheet" href={h} />)}
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: themeCssBoth(t) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
