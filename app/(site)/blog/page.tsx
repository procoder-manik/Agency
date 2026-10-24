import { permanentRedirect } from "next/navigation";
import { getAllSettings } from "@/lib/settings";
import { BASES } from "@/lib/permalinks";
import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("blog");

export default async function Page() {
  await getAllSettings();
  if (BASES.posts !== "blog") permanentRedirect(`/${BASES.posts}`);
  const page = await loadPage("blog");
  if (!page) return handleMissing("/blog");
  return <><JsonLd data={await pageSchema("blog", page)} /><Blocks blocks={page.data.blocks || []} status={(await getAllSettings()).identity.availability} /></>;
}
