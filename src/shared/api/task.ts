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
  createdAt: string;
  updatedAt: string;
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
  description: string;
  status: TaskStatus;
  deadline: string;
}>;

export type CreateTaskBody = {
  projectId: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  kind: TaskKind;
};

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

const TASK_STATUSES: TaskStatus[] = ["scheduled", "completed", "archived"];

// API は status を 1 つしか受け取れないため、ステータスごとに取得してつなげる
export async function getAllTasks(): Promise<Task[]> {
  const results = await Promise.all(
    TASK_STATUSES.map(async (status) => {
      const { tasks, pageInfo } = await getTasks({
        status,
        limit: 100,
        page: 1,
      });
      if (pageInfo.totalCount <= tasks.length) return tasks;
      // 1 回目で取り切れなかったときは、全件を 1 ページで取り直す
      const all = await getTasks({
        status,
        limit: pageInfo.totalCount,
        page: 1,
      });
      return all.tasks;
    }),
  );
  return results.flat();
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await axios.get<TaskResponse>(`/api/v1/users/tasks/${id}`);
  return data.data;
}

export async function createTask(body: CreateTaskBody): Promise<void> {
  await axios.post("/api/v1/users/tasks", body);
}

export async function deleteTask(id: string): Promise<void> {
  await axios.delete(`/api/v1/users/tasks/${id}`);
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
