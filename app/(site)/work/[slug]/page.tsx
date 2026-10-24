import { permanentRedirect } from "next/navigation";
import { getPublishedBySlug } from "@/lib/content";
import { entryUrl } from "@/lib/permalinks";
import { ProjectView, projectMetadata } from "@/components/site/ProjectView";

type P = { params: { slug: string } };
export const generateMetadata = ({ params }: P) => projectMetadata(params.slug);

export default async function WorkPage({ params }: P) {
  const e = await getPublishedBySlug("projects", params.slug);
  if (e) { const url = entryUrl("projects", e.slug, e.data as any); if (url !== `/work/${e.slug}`) permanentRedirect(url); }
  return <ProjectView slug={params.slug} />;
}
