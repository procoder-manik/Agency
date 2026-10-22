import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { getEntry } from "@/lib/content";
import { getAllSettings, brandTemplate } from "@/lib/settings";
import { menuState } from "@/lib/menu";
import { Editor } from "@/components/admin/Editor";

export default async function EditPage({ params }: { params: { collection: string; id: string } }) {
  const col = getCollection(params.collection); if (!col) notFound();
  const item = params.id === "new" ? null : await getEntry(Number(params.id));
  if (params.id !== "new" && (!item || item.collection !== col.key)) notFound();
  const s = await getAllSettings();
  let menu;
  if (col.key === "pages" && item) { const m = menuState(s.navigation, item.slug === "home" ? "/" : `/${item.slug}`, s.identity.domain); menu = { header: m.header, footer: m.footer, footerCol: m.footerCols[0] ?? 0 }; }
  return <Editor key={params.id} collection={col.key} initial={item ? JSON.parse(JSON.stringify(item)) : null} titleTemplate={brandTemplate(s.seo.titleTemplate, s.identity.name)} menu={menu} footerColumns={s.navigation.footer.map((c) => c.title)} />;
}
