import axios from "axios";

import type { Project } from "./project";

export type TaskStatus = "scheduled" | "completed" | "archived";

export type TaskKind = "task" | "milestone";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  kind: TaskKind;
  deadline: string;
  project: Project;
  parent?: Task;
  children: Task[];
};

export type PageInfo = {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type GetTasksParams = {
  limit?: number;
  page?: number;
  status?: TaskStatus;
};

export type UpdateTaskBody = Partial<{
  projectId: string;
  status: TaskStatus;
  deadline: string;
}>;

type TasksResponse = {
  data: Task[];
  pageInfo: PageInfo;
};

type TaskResponse = {
  data: Task;
};

export async function getTasks(
  params?: GetTasksParams,
): Promise<{ tasks: Task[]; pageInfo: PageInfo }> {
  const { data } = await axios.get<TasksResponse>("/api/v1/users/tasks", {
    params,
  });
  return { tasks: data.data, pageInfo: data.pageInfo };
}

export async function updateTask(
  id: string,
  body: UpdateTaskBody,
): Promise<Task> {
  const { data } = await axios.patch<TaskResponse>(
    `/api/v1/users/tasks/${id}`,
    body,
  );
  return data.data;
}
