export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getActiveTheme } from "@/lib/theme-server";
import { getAllSettings } from "@/lib/settings";
import { mediaUrl } from "@/lib/media";

/** Favicon / logo mark generated from Site identity and the active theme accent. */
export async function GET(req: Request) {
  const [t, s] = await Promise.all([getActiveTheme(), getAllSettings()]);
  const logo = mediaUrl(s.identity.logo);
  if (logo) return NextResponse.redirect(new URL(logo, req.url));
  const c = t.tokens.colors;
  const txt = (s.identity.shortName || s.identity.name.slice(0, 2)).slice(0, 3).replace(/[<>&"']/g, "");
  const size = txt.length > 2 ? 22 : 30;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.accent}"/><stop offset="1" stop-color="${c.accent2}"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><text x="32" y="33" dominant-baseline="central" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="${size}" fill="${c.onaccent}">${txt}</text></svg>`;
  return new NextResponse(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" } });
}
