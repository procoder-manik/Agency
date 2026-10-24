"use client";
import { useState } from "react";
import { SCHEMA_TYPES } from "@/lib/fields";
import { apiFetch, Spinner, Toggle, toast } from "./ui";
import { FieldInput } from "./FieldInput";
import { useAdmin, useItem } from "./context";

const Count = ({ n, lo, hi }: { n: number; lo: number; hi: number }) => <span className={`text-xs ${n === 0 ? "text-muted" : n < lo || n > hi ? "text-warning" : "text-success"}`}>{n} characters (aim for {lo} to {hi})</span>;

export const SEO_KEYS = ["focusKeyword", "keywords", "metaTitle", "metaDescription", "ogTitle", "ogDescription", "breadcrumbTitle", "schemaType"];

export async function aiSeo(collection: string, item: any) {
  const r = await apiFetch("/api/admin/ai", { method: "POST", json: { task: "seo", collection, item } });
  return r.data as Record<string, any>;
}
export function mergeSeo(cur: any, gen: any, onlyEmpty: boolean) {
  const out = { ...cur };
  for (const k of SEO_KEYS) {
    if (gen[k] === undefined) continue;
    const empty = !cur[k] || (Array.isArray(cur[k]) && !cur[k].length) || (k === "schemaType" && cur[k] === "auto");
    if (!onlyEmpty || empty) out[k] = gen[k];
  }
  return out;
}

export function SeoPanel({ tab, seo, onChange, titleTemplate, defaultSchema, path }: { tab: "SEO" | "Social" | "Schema"; seo: any; onChange: (s: any) => void; titleTemplate: string; defaultSchema: string; path?: string }) {
  const { aiOn } = useAdmin(); const { collection, item } = useItem();
  const [busy, setBusy] = useState(false); const [onlyEmpty, setOnlyEmpty] = useState(true);
  const set = (k: string, v: any) => onChange({ ...seo, [k]: v });
  const fullTitle = titleTemplate.replace("%s", seo.metaTitle || item.title || "");
  async function writeAll() {
    setBusy(true);
    try { onChange(mergeSeo(seo, await aiSeo(collection, item), onlyEmpty)); toast("SEO written. Review it, then save."); } catch (e: any) { toast(e.message, "error"); }
    setBusy(false);
  }
  if (tab === "Social") return (
    <div className="space-y-5">
      <FieldInput field={{ name: "ogTitle", label: "Open Graph title", type: "text" }} value={seo.ogTitle} onChange={(v) => set("ogTitle", v)} />
      <FieldInput field={{ name: "ogDescription", label: "Open Graph description", type: "textarea" }} value={seo.ogDescription} onChange={(v) => set("ogDescription", v)} />
      <FieldInput field={{ name: "ogImage", label: "Social image", type: "image", size: "1200 × 630 (1.91:1)", help: "Leave empty to use the cover image, or an automatic branded image." }} value={seo.ogImage ? { url: seo.ogImage } : ""} onChange={(v) => set("ogImage", typeof v === "object" ? v?.url || "" : v)} />
      <FieldInput field={{ name: "twitterCard", label: "Twitter / X card", type: "select", options: [{ value: "summary_large_image", label: "Large image" }, { value: "summary", label: "Small image" }] }} value={seo.twitterCard} onChange={(v) => set("twitterCard", v)} />
      {path && <div><p className="mb-2 text-sm text-fg2">Automatic share image preview</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={seo.ogImage || `/api/og?title=${encodeURIComponent(seo.ogTitle || seo.metaTitle || item.title || "")}&label=${encodeURIComponent(collection === "posts" ? "Article" : collection === "caseStudies" ? "Case Study" : collection === "services" ? "Service" : "Page")}`} alt="Share preview" className="w-full max-w-md rounded border border-line" /></div>}
    </div>
  );
  if (tab === "Schema") return (
    <div className="space-y-5">
      <FieldInput field={{ name: "schemaType", label: "Schema type", type: "select", options: SCHEMA_TYPES.map((t) => ({ value: t, label: t === "auto" ? `Automatic (${defaultSchema})` : t })), help: "Organization and breadcrumb schema are added automatically. Only real data from the page is used: no invented ratings, prices or dates." }} value={seo.schemaType || "auto"} onChange={(v) => set("schemaType", v)} />
      {path && <p className="text-sm text-fg2">Check the live output with Google&apos;s Rich Results Test after publishing: <a className="text-accent underline" target="_blank" rel="noopener" href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(location.origin + path)}`}>open test</a></p>}
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded border border-line bg-bg/40 p-3">
        <button type="button" className="btn btn-primary !py-2 text-sm" disabled={!aiOn || busy} onClick={writeAll}>{busy ? <Spinner /> : "✦"} Write all SEO with AI</button>
        <label className="flex items-center gap-2 text-sm text-fg2"><input type="radio" checked={onlyEmpty} onChange={() => setOnlyEmpty(true)} />Only empty fields</label>
        <label className="flex items-center gap-2 text-sm text-fg2"><input type="radio" checked={!onlyEmpty} onChange={() => setOnlyEmpty(false)} />Replace all</label>
        {!aiOn && <span className="text-xs text-muted">Add an AI key in Admin &gt; AI to enable.</span>}
      </div>
      <FieldInput field={{ name: "focusKeyword", label: "Focus keyword", type: "text", ai: true }} value={seo.focusKeyword} onChange={(v) => set("focusKeyword", v)} />
      <FieldInput field={{ name: "keywords", label: "Related keywords", type: "tags" }} value={Array.isArray(seo.keywords) ? seo.keywords : (seo.keywords || "").split(",").filter(Boolean)} onChange={(v) => set("keywords", v)} />
      <div><FieldInput field={{ name: "metaTitle", label: "Meta title", type: "text", ai: true }} value={seo.metaTitle} onChange={(v) => set("metaTitle", v)} /><div className="mt-1 flex flex-wrap justify-between gap-2"><Count n={(fullTitle || "").length} lo={30} hi={60} /><span className="truncate text-xs text-muted">Shows as: {fullTitle}</span></div></div>
      <div><FieldInput field={{ name: "metaDescription", label: "Meta description", type: "textarea", ai: true }} value={seo.metaDescription} onChange={(v) => set("metaDescription", v)} /><Count n={(seo.metaDescription || "").length} lo={120} hi={160} /></div>
      <FieldInput field={{ name: "breadcrumbTitle", label: "Breadcrumb title", type: "text", ai: true }} value={seo.breadcrumbTitle} onChange={(v) => set("breadcrumbTitle", v)} />
      <FieldInput field={{ name: "canonical", label: "Canonical URL override", type: "url", help: "Leave empty to use this page's own URL." }} value={seo.canonical} onChange={(v) => set("canonical", v)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="noindex (hide from search)" checked={!!seo.noindex} onChange={(v) => set("noindex", v)} />
        <Toggle label="nofollow" checked={!!seo.nofollow} onChange={(v) => set("nofollow", v)} />
        <Toggle label="noarchive" checked={!!seo.noarchive} onChange={(v) => set("noarchive", v)} />
        <Toggle label="nosnippet" checked={!!seo.nosnippet} onChange={(v) => set("nosnippet", v)} />
        <Toggle label="Leave out of sitemap" checked={!!seo.excludeFromSitemap} onChange={(v) => set("excludeFromSitemap", v)} />
      </div>
      <div className="rounded border border-line p-4"><p className="text-xs text-muted">Search preview</p><p className="mt-1 truncate text-lg text-accent">{fullTitle}</p><p className="text-sm text-success">{path}</p><p className="line-clamp-2 text-sm text-fg2">{seo.metaDescription || "Add a meta description so search engines show the right summary."}</p></div>
    </div>
  );
}
