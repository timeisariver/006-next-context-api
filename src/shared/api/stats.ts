import axios from "axios";

export type StatsData = {
  date: number;
  value: number;
};

export type Stats = {
  label: string;
  type: "completed" | "todo";
  data: StatsData[];
};

type StatsResponse = {
  data: Stats[];
};

export async function getStats(): Promise<Stats[]> {
  const { data } = await axios.get<StatsResponse>("/api/v1/users/stats");
  return data.data;
}
