"use client";

import { createContext, useEffect, useState } from "react";
import { getProjects, type Project } from "@/shared/api";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshProjects() {
    try {
      setProjects(await getProjects());
    } catch {
      // 今の一覧をそのまま使う
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch {
        setError("読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  return (
    <ProjectsContext value={{ projects, isLoading, error, refreshProjects }}>
      {children}
    </ProjectsContext>
  );
}
