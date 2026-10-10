import axios from "axios";
import type { Project } from "./types";

export async function getProjects(): Promise<Project[]> {
  const { data } = await axios.get("/api/v1/users/projects");
  return data.data;
}
