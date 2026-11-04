import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { ListScreen } from "@/components/admin/ListScreen";

export default async function List(
  props: { params: Promise<{ collection: string }>; searchParams: Promise<{ ai?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!getCollection(params.collection)) notFound();
  return <ListScreen key={params.collection} collection={params.collection} openAi={searchParams.ai === "1"} kind={params.collection === "pages" ? "pages" : undefined} />;
}
