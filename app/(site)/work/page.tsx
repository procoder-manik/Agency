import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("work");

export default async function Page() {
  const page = await loadPage("work");
  if (!page) return handleMissing("/work");
  return <><JsonLd data={await pageSchema("work", page)} /><Blocks blocks={page.data.blocks || []} /></>;
}
