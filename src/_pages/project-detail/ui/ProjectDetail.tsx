"use client";
import { useEffect, useState } from "react";
import { getProject, type Project } from "@/shared/api";
import { ProjectDetailCard } from "./ProjectDetailCard";

type Props = {
  slug: string;
};

export function ProjectDetail({ slug }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setProject(await getProject(slug));
      } catch {
        setError("読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [slug]);

  if (isLoading) return <p>読み込み中…</p>;
  if (error || !project) return <p>{error ?? "読み込みに失敗しました"}</p>;

  return <ProjectDetailCard project={project} />;
}
