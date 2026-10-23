"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getCollection } from "@/lib/collections";
import { slugify } from "@/lib/util";
import { apiFetch, Spinner, Tabs, Toggle, toast } from "./ui";
import { FieldInput } from "./FieldInput";
import { BlocksEditor } from "./BlocksEditor";
import { SeoPanel } from "./SeoPanel";
import { ItemProvider } from "./context";
import { ModulePreview, resetModules } from "./ModuleTools";

interface Props { collection: string; initial: any | null; titleTemplate: string; menu?: { header: boolean; footer: boolean; footerCol: number }; footerColumns?: string[] }

export function Editor({ collection, initial, titleTemplate, menu: menu0, footerColumns = [] }: Props) {
  const col = getCollection(collection)!;
  const router = useRouter();
  const [item, setItem] = useState<any>(initial || { title: "", slug: "", status: "draft", data: collection === "pages" ? { blocks: [] } : {}, seo: {}, sortOrder: 0, featured: false });
  const [menu, setMenu] = useState(menu0 || { header: false, footer: false, footerCol: 0 });
  const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false);
  const tabNames = [...Object.keys(col.tabs), ...(col.seo ? ["SEO", "Social", "Schema"] : []), "Advanced"];
  const [tab, setTab] = useState(tabNames[0]);
  const isNew = !initial;
  const path = col.publicPath && item.slug ? col.publicPath(item.slug) : "";
  const upd = (patch: any) => { setItem((x: any) => ({ ...x, ...patch })); setDirty(true); };
  const setData = (k: string, v: any) => { setItem((x: any) => ({ ...x, data: { ...x.data, [k]: v } })); setDirty(true); };

  const save = useCallback(async (status?: string) => {
    setSaving(true);
    try {
      const body = { collection, title: item.title, slug: item.slug, status: status || item.status, data: item.data, seo: item.seo, sortOrder: item.sortOrder, featured: item.featured, publishedAt: item.publishedAt, ...(collection === "pages" ? { menu } : {}) };
      if (isNew) {
        const r = await apiFetch("/api/admin/entries", { method: "POST", json: body });
        if (collection === "pages" && (menu.header || menu.footer)) await apiFetch(`/api/admin/entries/${r.item.id}`, { method: "PUT", json: { menu } });
        setDirty(false); toast(status === "published" ? "Published." : "Saved as draft."); router.replace(`/admin/c/${collection}/${r.item.id}`);
      } else {
        const r = await apiFetch(`/api/admin/entries/${item.id}`, { method: "PUT", json: body });
        if (collection === "modules") resetModules();
        setItem(r.item); setDirty(false); toast(status === "published" && item.status !== "published" ? "Published." : status === "draft" && item.status === "published" ? "Unpublished. It's a draft now." : "Changes saved.");
        router.refresh();
      }
    } catch (e: any) { toast(e.message, "error"); }
    setSaving(false);
  }, [item, menu, collection, isNew, router]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); } };
    const b = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("keydown", k); window.addEventListener("beforeunload", b);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("beforeunload", b); };
  }, [save, dirty]);

  async function trash() {
    if (!confirm(`Move this ${col.singular.toLowerCase()} to the trash? You can restore it later.`)) return;
    try { await apiFetch(`/api/admin/entries/${item.id}`, { method: "DELETE" }); toast("Moved to trash."); router.push(`/admin/c/${collection}`); } catch (e: any) { toast(e.message, "error"); }
  }

  const fields = (names: string[]) => (
    <div className="grid gap-6">{names.map((n) => {
      if (n === "__preview") return <ModulePreview key={n} item={item} />;
      if (n === "blocks") return <BlocksEditor key={n} blocks={item.data.blocks || []} onChange={(b) => setData("blocks", b)} pageTitle={item.title} builtin={!!item.builtin} />;
      const f = col.fields.find((x) => x.name === n); if (!f) return null;
      return <FieldInput key={n} field={f} value={item.data[n]} onChange={(v) => setData(n, v)} />;
    })}</div>
  );

  return (
    <ItemProvider value={{ collection, item }}>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <Link href={`/admin/c/${collection}`} className="text-sm text-fg2 hover:text-fg">← {col.label}</Link>
          <label className="sr-only" htmlFor="title">{col.titleLabel}</label>
          <input id="title" className="mt-2 w-full bg-transparent font-display text-2xl font-bold outline-none placeholder:text-muted sm:text-3xl" placeholder={col.titleLabel} value={item.title}
            onChange={(e) => upd({ title: e.target.value, ...(isNew && col.hasSlug && !item.slugTouched ? { slug: slugify(e.target.value) } : {}) })} />
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-fg2">
            <span className={`chip !py-0.5 ${item.status === "published" ? "!text-success" : ""}`}>{item.status === "published" ? "Published" : "Draft"}</span>
            {item.builtin && <span className="chip !py-0.5">Built-in page</span>}
            {path && <span className="font-mono text-xs">{path}</span>}
            {dirty && <span className="text-warning">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {path && !isNew && <a href={path} target="_blank" className="btn btn-ghost !py-2 text-sm">View</a>}
          <button className="btn btn-ghost !py-2 text-sm" disabled={saving} onClick={() => save()}>{saving ? <Spinner /> : isNew ? "Save draft" : "Save"}</button>
          {item.status === "published"
            ? <button className="btn btn-ghost !py-2 text-sm" disabled={saving} onClick={() => save("draft")}>Unpublish</button>
            : <button className="btn btn-primary !py-2 text-sm" disabled={saving} onClick={() => save("published")}>Publish</button>}
        </div>
      </div>
      <Tabs tabs={tabNames} active={tab} onChange={setTab} />
      <div className="glass mt-4 p-5 sm:p-6">
        {col.tabs[tab] && fields(col.tabs[tab])}
        {(tab === "SEO" || tab === "Social" || tab === "Schema") && <SeoPanel tab={tab} seo={item.seo || {}} onChange={(s) => upd({ seo: s })} titleTemplate={titleTemplate} defaultSchema={col.defaultSchema || "WebPage"} path={path} />}
        {tab === "Advanced" && (
          <div className="grid gap-6">
            {col.hasSlug && <div>
              <label className="label" htmlFor="slug">URL slug</label>
              <div className="flex items-center gap-2"><span className="text-sm text-muted">{path ? path.replace(/[^/]*$/, "") : "/"}</span><input id="slug" className="input font-mono" disabled={item.builtin} value={item.slug} onChange={(e) => upd({ slug: e.target.value, slugTouched: true })} onBlur={(e) => upd({ slug: slugify(e.target.value) })} /></div>
              {item.builtin && <p className="mt-1 text-xs text-muted">Built-in pages keep a fixed address. You can unpublish them, but not rename or delete them.</p>}
            </div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="order">Order</label><input id="order" type="number" className="input" value={item.sortOrder ?? 0} onChange={(e) => upd({ sortOrder: Number(e.target.value) })} /><p className="mt-1 text-xs text-muted">Lower numbers show first.</p></div>
              <div><label className="label" htmlFor="pub">Publish date</label><input id="pub" type="datetime-local" className="input" value={item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : ""} onChange={(e) => upd({ publishedAt: e.target.value })} /></div>
            </div>
            <Toggle label="Featured" help="Featured items show first on grids and the home page." checked={!!item.featured} onChange={(v) => upd({ featured: v })} />
            {collection === "pages" && !item.builtin && <Toggle label="Use this page as a location template" help="Template pages are hidden from the site. Use {{service}}, {{industries}}, {{location}} and {{city}} in the text, then generate pages from Location pages." checked={!!item.data.template} onChange={(v) => setData("template", v || undefined)} />}
            {collection === "pages" && (
              <div className="rounded border border-line p-4">
                <p className="mb-3 font-medium">Menus</p>
                <div className="space-y-3">
                  <Toggle label="Show in header menu" checked={menu.header} onChange={(v) => { setMenu({ ...menu, header: v }); setDirty(true); }} />
                  <Toggle label="Show in footer menu" checked={menu.footer} onChange={(v) => { setMenu({ ...menu, footer: v }); setDirty(true); }} />
                  {menu.footer && footerColumns.length > 1 && <select className="input max-w-xs" value={menu.footerCol} onChange={(e) => { setMenu({ ...menu, footerCol: Number(e.target.value) }); setDirty(true); }}>{footerColumns.map((c, i) => <option key={i} value={i}>Footer column: {c}</option>)}</select>}
                  <p className="text-xs text-muted">These switches edit the same menus as Appearance &gt; Navigation.</p>
                </div>
              </div>
            )}
            {!isNew && !item.builtin && <div className="border-t border-line pt-5"><button className="btn btn-ghost !border-danger/50 !py-2 text-sm text-danger" onClick={trash}>Move to trash</button></div>}
          </div>
        )}
      </div>
    </ItemProvider>
  );
}
