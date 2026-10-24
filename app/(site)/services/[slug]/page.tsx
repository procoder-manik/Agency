import { permanentRedirect } from "next/navigation";
import { getPublishedBySlug } from "@/lib/content";
import { entryUrl } from "@/lib/permalinks";
import { ServiceView, serviceMetadata } from "@/components/site/views/ServiceView";

type P = { params: { slug: string } };
export const generateMetadata = ({ params }: P) => serviceMetadata(params.slug);

export default async function Page({ params }: P) {
  // if this item has its own address, or the base name was changed in Site settings, the old address redirects (one canonical URL, no duplicates)
  const e = await getPublishedBySlug("services", params.slug);
  if (e) { const url = entryUrl("services", e.slug, e.data as any); if (url !== `/services/${e.slug}`) permanentRedirect(url); }
  return <ServiceView slug={params.slug} />;
}
