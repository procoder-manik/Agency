import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { TagsAdmin } from "@/components/admin/TagsAdmin";

export default async function Page(props: { params: Promise<{ collection: string }> }) {
  const params = await props.params;
  const c = getCollection(params.collection);
  if (!c || !c.fields.some((f) => f.name === "tags" && f.type === "tags")) notFound();
  return <TagsAdmin key={c.key} collection={c.key} label={c.label} listHref={`/admin/c/${c.key}`} />;
}
