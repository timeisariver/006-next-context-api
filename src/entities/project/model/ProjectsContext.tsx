"use client";

import { createContext } from "react";
import { getProjects, type Project } from "@/shared/api";
import { useFetch } from "@/shared/lib";

type ProjectsValue = {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  // 件数などの集計を取り直す（読み込み中表示にはしない。失敗しても今の一覧を残す）
  refreshProjects: () => Promise<void>;
};

export const ProjectsContext = createContext<ProjectsValue>({
  projects: [],
  isLoading: true,
  error: null,
  refreshProjects: async () => {},
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, setData } = useFetch("projects", getProjects);
  const projects = data ?? [];

  async function refreshProjects() {
    try {
      const newProjects = await getProjects();
      setData(() => newProjects);
    } catch {
      // 今の一覧をそのまま使う
    }
  }

  return (
    <ProjectsContext value={{ projects, isLoading, error, refreshProjects }}>
      {children}
    </ProjectsContext>
  );
}
