import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("home");

export default async function Home() {
  const page = await loadPage("home");
  if (!page) return handleMissing("/");
  return <><JsonLd data={await pageSchema("home", page)} /><Blocks blocks={page.data.blocks || []} /></>;
}
