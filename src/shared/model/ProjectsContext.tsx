"use client";

import { createContext, useEffect, useState } from "react";
import { getProjects, type Project } from "../api";

type ProjectsValue = {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
};

export const ProjectsContext = createContext<ProjectsValue>({
  projects: [],
  isLoading: true,
  error: null,
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <ProjectsContext value={{ projects, isLoading, error }}>
      {children}
    </ProjectsContext>
  );
}
