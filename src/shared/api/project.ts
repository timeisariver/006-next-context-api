import axios from "axios";

export type ProjectStats = {
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

export type Project = {
  id: string;
  name: string;
  goal: string;
  shouldbe: string;
  deadline: string;
  color: string;
  slug: string;
  stats: ProjectStats;
};

export async function getProjects(): Promise<Project[]> {
  const { data } = await axios.get("/api/v1/users/projects");
  return data.data;
}
