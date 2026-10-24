import { getAllSettings } from "@/lib/settings";
import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";
import { ProjectView, projectMetadata } from "@/components/site/ProjectView";

type P = { params: { slug: string[] } };

export async function generateMetadata({ params }: P) {
  if (params.slug.length === 2 && decodeURIComponent(params.slug[0]) === (await getAllSettings()).portfolio.base) return projectMetadata(decodeURIComponent(params.slug[1]));
  return params.slug.length === 1 ? pageMetadata(decodeURIComponent(params.slug[0])) : {};
}

export default async function CatchAll({ params }: P) {
  const path = "/" + params.slug.map(decodeURIComponent).join("/");
  // project pages when the portfolio URL name is not "work"
  if (params.slug.length === 2 && decodeURIComponent(params.slug[0]) === (await getAllSettings()).portfolio.base) return <ProjectView slug={decodeURIComponent(params.slug[1])} />;
  if (params.slug.length !== 1 || params.slug[0] === "home") return handleMissing(path);
  const slug = decodeURIComponent(params.slug[0]);
  const page = await loadPage(slug);
  if (!page) return handleMissing(path);
  return <><JsonLd data={await pageSchema(slug, page)} /><Blocks blocks={page.data.blocks || []} status={(await getAllSettings()).identity.availability} /></>;
}
