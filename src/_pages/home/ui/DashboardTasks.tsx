"use client";
import clsx from "clsx";
import { useProjects } from "@/entities/project";
import { TaskTable } from "@/entities/task";
import { DashboardHead, MoreLink } from "@/shared/ui";
import { getTasks, type Task } from "@/shared/api";
import { useFetch } from "@/shared/lib";
import s from "./DashboardTasks.module.scss";

const LIMIT = 20;

type Props = {
  className?: string;
};

export function DashboardTasks({ className }: Props) {
  const { projects } = useProjects();
  const { data, isLoading, error, setData } = useFetch(() =>
    getTasks({ limit: LIMIT }),
  );
  const tasks = data?.tasks ?? [];
  const remainingPages = data
    ? Math.ceil(data.pageInfo.totalCount / LIMIT) - 1
    : 0;

  function handleChange(updated: Task) {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === updated.id ? updated : task,
      ),
    }));
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
