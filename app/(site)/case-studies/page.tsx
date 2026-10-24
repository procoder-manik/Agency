import { permanentRedirect } from "next/navigation";
import { getAllSettings } from "@/lib/settings";
import { BASES } from "@/lib/permalinks";
import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

export const generateMetadata = () => pageMetadata("case-studies");

export default async function Page() {
  await getAllSettings();
  if (BASES.caseStudies !== "case-studies") permanentRedirect(`/${BASES.caseStudies}`);
  const page = await loadPage("case-studies");
  if (!page) return handleMissing("/case-studies");
  return <><JsonLd data={await pageSchema("case-studies", page)} /><Blocks blocks={page.data.blocks || []} status={(await getAllSettings()).identity.availability} /></>;
}
