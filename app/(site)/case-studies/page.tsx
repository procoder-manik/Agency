import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("case-studies");

export default async function Page() {
  const page = await loadPage("case-studies");
  if (!page) return handleMissing("/case-studies");
  return <><JsonLd data={await pageSchema("case-studies", page)} /><Blocks blocks={page.data.blocks || []} /></>;
}
