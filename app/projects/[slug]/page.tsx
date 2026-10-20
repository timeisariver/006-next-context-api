import { ProjectDetail } from "@/_pages/project-detail";

export default async function Page({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} />;
}
