"use client";
import { useEffect, useState } from "react";
import { getTask, type Task } from "@/shared/api";
import { TaskDetailForm } from "./TaskDetailForm";

type Props = {
  id: string;
};

export function TaskDetail({ id }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setTask(await getTask(id));
      } catch {
        setError("読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [id]);

  if (isLoading) return <p>読み込み中…</p>;
  if (error || !task) return <p>{error ?? "読み込みに失敗しました"}</p>;

  return <TaskDetailForm key={task.id} initialTask={task} />;
}
