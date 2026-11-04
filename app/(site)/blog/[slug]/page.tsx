import { permanentRedirect } from "next/navigation";
import { getPublishedBySlug } from "@/lib/content";
import { entryUrl } from "@/lib/permalinks";
import { PostView, postMetadata } from "@/components/site/views/PostView";

type P = { params: Promise<{ slug: string }> };
export const generateMetadata = async (props: P) => {
  const params = await props.params;
  return postMetadata(params.slug);
};

export default async function Page(props: P) {
  const params = await props.params;
  // if this item has its own address, or the base name was changed in Site settings, the old address redirects (one canonical URL, no duplicates)
  const e = await getPublishedBySlug("posts", params.slug);
  if (e) { const url = entryUrl("posts", e.slug, e.data as any); if (url !== `/blog/${e.slug}`) permanentRedirect(url); }
  return <PostView slug={params.slug} />;
}
