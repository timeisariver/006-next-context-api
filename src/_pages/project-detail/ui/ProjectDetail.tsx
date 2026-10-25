"use client";
import { getProject } from "@/shared/api";
import { useFetch } from "@/shared/lib";
import { ProjectDetailCard } from "./ProjectDetailCard";

type Props = {
  slug: string;
};

export function ProjectDetail({ slug }: Props) {
  const {
    data: project,
    isLoading,
    error,
  } = useFetch(slug, () => getProject(slug));

  if (isLoading) return <p>読み込み中…</p>;
  if (error || !project) return <p>{error ?? "読み込みに失敗しました"}</p>;

  return <ProjectDetailCard project={project} />;
}
