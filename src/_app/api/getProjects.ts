import axios from "axios";

export async function getProjects() {
  const { data } = await axios.get("/api/v1/users/projects");
  return data.data;
}
