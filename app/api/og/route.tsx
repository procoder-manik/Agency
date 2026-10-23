export const dynamic = "force-dynamic";
import { ImageResponse } from "next/og";
import { getActiveTheme } from "@/lib/theme-server";
import { getAllSettings } from "@/lib/settings";

export const runtime = "nodejs";

const SIZES: Record<string, [number, number]> = { page: [1200, 630], post: [1600, 900], case: [1200, 1500] };

/** Branded share/cover image rendered at request time from the active theme. No AI, no external network. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const title = (u.searchParams.get("title") || "").slice(0, 120);
  const label = (u.searchParams.get("label") || "").slice(0, 30);
  const [w, h] = SIZES[u.searchParams.get("kind") || "page"] || SIZES.page;
  const [t, s] = await Promise.all([getActiveTheme(), getAllSettings()]);
  const c = t.tokens.colors; const id = s.identity;
  const tall = h > w;
  const fs = Math.round((tall ? 0.105 : 0.062) * w * (title.length > 70 ? 0.78 : 1));
  const tex = t.tokens.texture;
  const bgImg = tex === "grid" ? `linear-gradient(${c.line} 1px, transparent 1px), linear-gradient(90deg, ${c.line} 1px, transparent 1px)`
    : tex === "dots" ? `radial-gradient(${c.line} 2px, transparent 2px)` : "none";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: c.bg, color: c.fg, padding: Math.round(w * 0.06), position: "relative" }}>
        {bgImg !== "none" && <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: bgImg, backgroundSize: tex === "dots" ? "28px 28px" : "64px 64px", opacity: 0.6 }} />}
        <div style={{ position: "absolute", top: -h * 0.3, right: -w * 0.15, width: w * 0.75, height: w * 0.75, borderRadius: "50%", display: "flex", background: `radial-gradient(circle, ${c.accent}66, transparent 65%)` }} />
        <div style={{ position: "absolute", bottom: -h * 0.35, left: -w * 0.2, width: w * 0.7, height: w * 0.7, borderRadius: "50%", display: "flex", background: `radial-gradient(circle, ${c.accent2}44, transparent 65%)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, color: c.onaccent, fontSize: 26, fontWeight: 800 }}>{(id.shortName || id.name.slice(0, 2)).slice(0, 3)}</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{id.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {label && <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 20px", borderRadius: 999, border: `2px solid ${c.accent}`, color: c.accent, fontSize: 26, fontWeight: 600 }}>{label}</div>}
          <div style={{ fontSize: fs, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, display: "flex" }}>{title || id.tagline}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: c.fg2 }}>
          <span>{(id.domain || "").replace(/^https?:\/\//, "")}</span>
          <div style={{ display: "flex", width: 160, height: 8, borderRadius: 8, background: `linear-gradient(90deg, ${c.accent}, ${c.accent2})` }} />
        </div>
      </div>
    ),
    { width: w, height: h, headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}
