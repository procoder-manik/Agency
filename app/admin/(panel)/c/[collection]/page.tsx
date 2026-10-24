import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { ListScreen } from "@/components/admin/ListScreen";

export default function List({ params, searchParams }: { params: { collection: string }; searchParams: { ai?: string } }) {
  if (!getCollection(params.collection)) notFound();
  return <ListScreen key={params.collection} collection={params.collection} openAi={searchParams.ai === "1"} kind={params.collection === "pages" ? "pages" : undefined} />;
}
