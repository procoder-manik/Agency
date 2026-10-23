import { getAllSettings } from "@/lib/settings";
import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";

type P = { params: { slug: string[] } };

export async function generateMetadata({ params }: P) {
  return params.slug.length === 1 ? pageMetadata(decodeURIComponent(params.slug[0])) : {};
}

export default async function CatchAll({ params }: P) {
  const path = "/" + params.slug.map(decodeURIComponent).join("/");
  if (params.slug.length !== 1 || params.slug[0] === "home") return handleMissing(path);
  const slug = decodeURIComponent(params.slug[0]);
  const page = await loadPage(slug);
  if (!page) return handleMissing(path);
  return <><JsonLd data={await pageSchema(slug, page)} /><Blocks blocks={page.data.blocks || []} status={(await getAllSettings()).identity.availability} /></>;
}
