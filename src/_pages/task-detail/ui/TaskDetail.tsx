"use client";
import { getTask } from "@/shared/api";
import { useFetch } from "@/shared/lib";
import { TaskDetailForm } from "./TaskDetailForm";

type Props = {
  id: string;
};

export function TaskDetail({ id }: Props) {
  const { data: task, isLoading, error } = useFetch(() => getTask(id));

  if (isLoading) return <p>読み込み中…</p>;
  if (error || !task) return <p>{error ?? "読み込みに失敗しました"}</p>;

  return <TaskDetailForm key={task.id} initialTask={task} />;
}
