import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("blog");

export default async function Page() {
  const page = await loadPage("blog");
  if (!page) return handleMissing("/blog");
  return <><JsonLd data={await pageSchema("blog", page)} /><Blocks blocks={page.data.blocks || []} /></>;
}
