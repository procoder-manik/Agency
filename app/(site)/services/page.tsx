import { permanentRedirect } from "next/navigation";
import { getAllSettings } from "@/lib/settings";
import { BASES } from "@/lib/permalinks";
import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("services");

export default async function Page() {
  await getAllSettings();
  if (BASES.services !== "services") permanentRedirect(`/${BASES.services}`);
  const page = await loadPage("services");
  if (!page) return handleMissing("/services");
  return <><JsonLd data={await pageSchema("services", page)} /><Blocks blocks={page.data.blocks || []} status={(await getAllSettings()).identity.availability} /></>;
}
