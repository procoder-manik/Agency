import { permanentRedirect } from "next/navigation";
import { getAllSettings } from "@/lib/settings";
import { ProjectView, projectMetadata } from "@/components/site/ProjectView";

type P = { params: { slug: string } };
export const generateMetadata = ({ params }: P) => projectMetadata(params.slug);

export default async function WorkPage({ params }: P) {
  const base = (await getAllSettings()).portfolio.base;
  if (base !== "work") permanentRedirect(`/${base}/${params.slug}`); // the portfolio URL name was changed in Site settings
  return <ProjectView slug={params.slug} />;
}
