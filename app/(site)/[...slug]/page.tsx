import { permanentRedirect } from "next/navigation";
import { getAllSettings } from "@/lib/settings";
import { Blocks } from "@/components/site/Blocks";
import { JsonLd, handleMissing, loadPage, pageMetadata, pageSchema } from "@/lib/page-render";
import { resolveAddress } from "@/lib/resolve";
import { entryUrl } from "@/lib/permalinks";
import { PostView, postMetadata } from "@/components/site/views/PostView";
import { ServiceView, serviceMetadata } from "@/components/site/views/ServiceView";
import { CaseView, caseMetadata } from "@/components/site/views/CaseView";
import { ProjectView, projectMetadata } from "@/components/site/ProjectView";

type P = { params: { slug: string[] } };
const urlOf = (p: P["params"]) => "/" + p.slug.map(decodeURIComponent).join("/");

export async function generateMetadata({ params }: P) {
  await getAllSettings(); // loads the permalink settings
  const hit = await resolveAddress(urlOf(params));
  if (hit) {
    const slug = hit.entry.slug;
    if (hit.collection === "pages") return pageMetadata(slug);
    if (hit.collection === "posts") return postMetadata(slug);
    if (hit.collection === "services") return serviceMetadata(slug);
    if (hit.collection === "caseStudies") return caseMetadata(slug);
    if (hit.collection === "projects") return projectMetadata(slug);
  }
  return params.slug.length === 1 ? pageMetadata(decodeURIComponent(params.slug[0])) : {};
}

/** Handles every address that is not a built-in route: pages (also nested ones), and any item with its own address or a renamed base. */
export default async function CatchAll({ params }: P) {
  const s = await getAllSettings();
  const url = urlOf(params);
  const hit = await resolveAddress(url);
  if (hit) {
    const slug = hit.entry.slug;
    if (hit.collection === "posts") return <PostView slug={slug} />;
    if (hit.collection === "services") return <ServiceView slug={slug} />;
    if (hit.collection === "caseStudies") return <CaseView slug={slug} />;
    if (hit.collection === "projects") return <ProjectView slug={slug} />;
    const page = await loadPage(slug);
    if (page) return <><JsonLd data={await pageSchema(slug, page)} /><Blocks blocks={page.data.blocks || []} status={s.identity.availability} /></>;
    return handleMissing(url);
  }
  // an old address: the page exists but now lives at another address (parent page or custom permalink). One canonical URL, so redirect.
  if (params.slug.length === 1 && params.slug[0] !== "home") {
    const page = await loadPage(decodeURIComponent(params.slug[0]));
    if (page) { const canon = entryUrl("pages", page.slug, page.data as any); if (canon !== url) permanentRedirect(canon); }
  }
  return handleMissing(url);
}
