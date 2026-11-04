import { permanentRedirect } from "next/navigation";
import { getPublishedBySlug } from "@/lib/content";
import { entryUrl } from "@/lib/permalinks";
import { CaseView, caseMetadata } from "@/components/site/views/CaseView";

type P = { params: Promise<{ slug: string }> };
export const generateMetadata = async (props: P) => {
  const params = await props.params;
  return caseMetadata(params.slug);
};

export default async function Page(props: P) {
  const params = await props.params;
  // if this item has its own address, or the base name was changed in Site settings, the old address redirects (one canonical URL, no duplicates)
  const e = await getPublishedBySlug("caseStudies", params.slug);
  if (e) { const url = entryUrl("caseStudies", e.slug, e.data as any); if (url !== `/case-studies/${e.slug}`) permanentRedirect(url); }
  return <CaseView slug={params.slug} />;
}
