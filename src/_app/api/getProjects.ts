import axios from "axios";

export function getProjects() {
  return axios.get("/api/v1/users/projects").then((res) => {
    return res.data.data;
  });
}
