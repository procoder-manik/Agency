"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COLOR_TOKENS, CURATED_FONTS, contrastReport, fontHref, normalizeTokens, themeCss, type Theme, type ThemeTokens } from "@/lib/themes";
import { apiFetch, PageHead, Spinner, toast } from "./ui";

function texStyle(t: ThemeTokens): React.CSSProperties {
  const l = t.colors.line;
  if (t.texture === "grid") return { backgroundImage: `linear-gradient(${l} 1px, transparent 1px), linear-gradient(90deg, ${l} 1px, transparent 1px)`, backgroundSize: "28px 28px" };
  if (t.texture === "dots") return { backgroundImage: `radial-gradient(${l} 1.2px, transparent 1.2px)`, backgroundSize: "14px 14px" };
  if (t.texture === "aurora") return { background: `radial-gradient(60% 70% at 15% 0%, ${t.colors.accent}44, transparent 70%), radial-gradient(50% 60% at 90% 10%, ${t.colors.accent2}33, transparent 70%)` };
  if (t.texture === "noise") return { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E")` };
  return {};
}

/** Real components rendered with a theme's tokens scoped to this box. */
export function ThemePreview({ t, id, compact = false }: { t: ThemeTokens; id: string; compact?: boolean }) {
  const cls = `pv-${id.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div className={`${cls} overflow-hidden bg-bg font-body text-fg`} style={{ borderRadius: "var(--r-lg)" }}>
      <style dangerouslySetInnerHTML={{ __html: themeCss(t, `.${cls}`) }} />
      {Array.from(new Set([t.fonts.display, t.fonts.body, t.fonts.mono])).map((f) => <link key={f} rel="stylesheet" href={fontHref(f)} />)}
      <div className="relative p-5" style={texStyle(t)}>
        <p className="font-display font-bold leading-tight" style={{ fontSize: compact ? 20 : 30, letterSpacing: "-0.02em" }}>We build sites that bring in work</p>
        {!compact && <p className="mt-2 text-sm text-fg2">Design, development and SEO for growing businesses.</p>}
        <div className="mt-4 flex flex-wrap gap-2"><span className="btn btn-primary !px-3 !py-1.5 text-xs">Book a call</span><span className="btn btn-ghost !px-3 !py-1.5 text-xs">See work</span></div>
        {!compact && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="glass p-4"><p className="font-display font-semibold">Website design</p><p className="mt-1 text-xs text-fg2">Fast, accessible sites.</p><p className="mt-3 font-mono text-xs text-accent">From $900</p></div>
            <div className="glass space-y-2 p-4"><label className="label !mb-0 text-xs">Email</label><input className="input !py-1.5 text-xs" placeholder="you@company.com" readOnly /><p className="text-xs text-muted">Muted helper text <span className="text-success">✓ Success</span> <span className="text-danger">Error</span></p></div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ThemeStudio({ themes, active }: { themes: Theme[]; active: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<{ slug?: string; name: string; tokens: ThemeTokens } | null>(null);
  const [busy, setBusy] = useState("");
  const report = useMemo(() => (editing ? contrastReport(editing.tokens) : []), [editing]);
  async function act(action: string, body: any, msg: string) {
    setBusy(action + (body.slug || ""));
    try { const r = await apiFetch("/api/admin/themes", { method: "POST", json: { action, ...body } }); toast(msg); router.refresh(); return r; } catch (e: any) { toast(e.message, "error"); }
    finally { setBusy(""); }
  }
  const setTok = (patch: Partial<ThemeTokens>) => setEditing((e) => e && { ...e, tokens: { ...e.tokens, ...patch } });
  const setColor = (k: string, v: string) => setEditing((e) => e && { ...e, tokens: { ...e.tokens, colors: { ...e.tokens.colors, [k]: v } } });

  if (editing) return (
    <>
      <PageHead title={editing.slug ? `Edit “${editing.name}”` : "New custom theme"}>
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button>
        <button className="btn btn-ghost !py-2 text-sm" disabled={!!busy} onClick={async () => { const r = await act("save", { slug: editing.slug, name: editing.name, tokens: editing.tokens }, "Theme saved."); if (r) setEditing({ ...editing, slug: r.slug }); }}>Save theme</button>
        <button className="btn btn-primary !py-2 text-sm" disabled={!!busy} onClick={async () => { const r = await act("save", { slug: editing.slug, name: editing.name, tokens: editing.tokens }, "Theme saved."); if (r) { await act("activate", { slug: r.slug }, "Theme saved and applied to the site."); setEditing(null); } }}>Save and apply</button>
      </PageHead>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="glass space-y-6 p-5">
          <div><label className="label" htmlFor="tn">Theme name</label><input id="tn" className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div>
            <p className="mb-2 font-medium">Colours</p>
            <div className="grid gap-3 sm:grid-cols-2">{COLOR_TOKENS.map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm"><input type="color" className="h-9 w-11 cursor-pointer rounded border border-line bg-transparent" value={editing.tokens.colors[k]} onChange={(e) => setColor(k, e.target.value)} />
                <span className="flex-1 text-fg2">{label}</span><input className="input !w-24 !px-2 !py-1 font-mono text-xs" value={editing.tokens.colors[k]} onChange={(e) => setColor(k, e.target.value)} aria-label={`${label} hex`} /></label>
            ))}</div>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Accessibility (WCAG AA)</p>
            {report.map((r) => <p key={r.label} className={`flex justify-between text-sm ${r.pass ? "text-fg2" : "text-danger"}`}><span>{r.pass ? "✓" : "✕"} {r.label}</span><span className="font-mono">{r.ratio.toFixed(2)}:1 (min {r.min})</span></p>)}
            {report.some((r) => !r.pass) && <p className="text-xs text-warning">Some text won&apos;t be readable for everyone. Adjust the colours marked ✕.</p>}
          </div>
          <div>
            <p className="mb-2 font-medium">Fonts</p>
            <datalist id="fonts">{CURATED_FONTS.map((f) => <option key={f} value={f} />)}</datalist>
            <div className="grid gap-3 sm:grid-cols-3">{(["display", "body", "mono"] as const).map((k) => (
              <div key={k}><label className="label capitalize" htmlFor={`f-${k}`}>{k}</label><input id={`f-${k}`} list="fonts" className="input" value={editing.tokens.fonts[k]} onChange={(e) => setTok({ fonts: { ...editing.tokens.fonts, [k]: e.target.value } })} /></div>
            ))}</div>
            <p className="mt-1 text-xs text-muted">Pick from the list or type any Google Fonts family name exactly as it appears on fonts.google.com.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["mode", "Mode", ["dark", "light"]], ["radius", "Corners", ["sharp", "soft", "pill"]], ["texture", "Background texture", ["none", "grid", "dots", "noise", "aurora"]], ["motion", "Motion", ["minimal", "standard", "playful"]]] as const).map(([k, l, o]) => (
              <div key={k}><label className="label" htmlFor={`t-${k}`}>{l}</label><select id={`t-${k}`} className="input capitalize" value={(editing.tokens as any)[k]} onChange={(e) => setTok({ [k]: e.target.value } as any)}>{o.map((x) => <option key={x}>{x}</option>)}</select></div>
            ))}
          </div>
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start"><p className="mb-2 text-sm text-fg2">Live preview</p><ThemePreview t={normalizeTokens(editing.tokens)} id="live" /></div>
      </div>
    </>
  );

  return (
    <>
      <PageHead title="Themes" sub="Switch the whole site's colours, fonts, corners, texture and motion. Changes go live instantly.">
        <button className="btn btn-primary !py-2 text-sm" onClick={() => setEditing({ name: "My theme", tokens: structuredClone(themes.find((t) => t.slug === active)?.tokens || themes[0].tokens) })}>Create custom theme</button>
      </PageHead>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((t) => (
          <div key={t.slug} className={`glass p-3 ${t.slug === active ? "!border-accent" : ""}`}>
            <ThemePreview t={t.tokens} id={t.slug} compact />
            <div className="mt-3 flex items-center justify-between gap-2 px-1">
              <div><p className="font-medium">{t.name}</p><p className="text-xs text-muted">{t.builtin ? "Built-in" : "Custom"} · {t.tokens.fonts.display} / {t.tokens.fonts.body}</p></div>
              {t.slug === active ? <span className="chip !text-success">Active</span> : <button className="btn btn-primary !px-3 !py-1.5 text-xs" disabled={!!busy} onClick={() => act("activate", { slug: t.slug }, `${t.name} is now live.`)}>{busy === "activate" + t.slug ? <Spinner /> : "Apply"}</button>}
            </div>
            <div className="mt-2 flex gap-3 px-1 text-xs">
              <button className="text-accent hover:underline" onClick={() => setEditing({ name: `${t.name} copy`, tokens: structuredClone(t.tokens) })}>Duplicate</button>
              {!t.builtin && <button className="text-accent hover:underline" onClick={() => setEditing({ slug: t.slug, name: t.name, tokens: structuredClone(t.tokens) })}>Edit</button>}
              {!t.builtin && t.slug !== active && <button className="text-danger hover:underline" onClick={() => confirm(`Delete ${t.name}?`) && act("delete", { slug: t.slug }, "Theme deleted.")}>Delete</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
