import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getActiveTheme } from "@/lib/theme-server";
import { getAllSettings, siteUrl } from "@/lib/settings";
import { themeCss, themeFontHrefs } from "@/lib/themes";

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
  const t = await getActiveTheme();
  return { themeColor: t.tokens.colors.bg, colorScheme: t.tokens.mode, width: "device-width", initialScale: 1 };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme();
  const t = theme.tokens;
  return (
    <html lang="en" data-mode={t.mode} data-texture={t.texture} data-motion={t.motion} data-theme={theme.slug} className={t.mode === "dark" ? "dark" : ""}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {themeFontHrefs(t).map((h) => <link key={h} rel="stylesheet" href={h} />)}
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: themeCss(t) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
