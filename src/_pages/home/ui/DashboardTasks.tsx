"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useProjects } from "@/entities/project";
import { TaskTable } from "@/entities/task";
import { DashboardHead, MoreLink } from "@/shared/ui";
import { getTasks, type Task } from "@/shared/api";
import s from "./DashboardTasks.module.scss";

const LIMIT = 20;

type Props = {
  className?: string;
};

export function DashboardTasks({ className }: Props) {
  const { projects } = useProjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [remainingPages, setRemainingPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const { tasks, pageInfo } = await getTasks({ limit: LIMIT });
        setTasks(tasks);
        setRemainingPages(Math.ceil(pageInfo.totalCount / LIMIT) - 1);
      } catch {
        setError("読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  function handleChange(updated: Task) {
    setTasks((prev) =>
      prev.map((task) => (task.id === updated.id ? updated : task)),
    );
  }

  return (
    <div className={clsx(s.root, className)}>
      <div className={s.head}>
        <DashboardHead text="タスク一覧" />
        <MoreLink text="タスク一覧" href="/tasks" />
      </div>
      <div className={s.content}>
        {isLoading ? (
          <p>読み込み中…</p>
        ) : error ? (
          <p>{error}</p>
        ) : tasks.length === 0 ? (
          <p>タスクはありません</p>
        ) : (
          <TaskTable
            tasks={tasks}
            projects={projects}
            onChange={handleChange}
          />
        )}
      </div>
      {remainingPages > 0 && (
        <div className={s.links}>
          <MoreLink text={`あと ${remainingPages} ページ`} href="/tasks" />
        </div>
      )}
    </div>
  );
}
