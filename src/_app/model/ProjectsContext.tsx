"use client";

import { createContext, useEffect, useState } from "react";
import { getProjects } from "../api";

type Project = {
  id: string;
  name: string;
  goal: string;
  shouldbe: string;
  deadline: string;
  color: string;
  slug: string;
  stats: ProjectStats;
};

type ProjectStats = {
  kinds: {
    milestone: number;
    task: number;
    total: number;
  };
  states: {
    scheduled: number;
    archived: number;
    completed: number;
  };
  total: number;
};

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
    getProjects()
      .then((data) => setProjects(data))
      .catch(() => setError("読み込みに失敗しました"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ProjectsContext value={{ projects, isLoading, error }}>
      {children}
    </ProjectsContext>
  );
}
