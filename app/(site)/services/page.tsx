import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("services");

export default async function Page() {
  const page = await loadPage("services");
  if (!page) return handleMissing("/services");
  return <><JsonLd data={await pageSchema("services", page)} /><Blocks blocks={page.data.blocks || []} /></>;
}
