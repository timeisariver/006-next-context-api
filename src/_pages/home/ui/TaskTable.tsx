"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { DashboardHead, MoreLink } from "@/shared/ui";
import { getTasks, type Task } from "@/shared/api";
import { TaskRow } from "./TaskRow";
import s from "./TaskTable.module.scss";

const LIMIT = 20;

type Props = {
  className?: string;
};

export function TaskTable({ className }: Props) {
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
        <MoreLink text="すべてのタスクをみる" href="/tasks" />
      </div>
      <div className={s.content}>
        {isLoading ? (
          <p>読み込み中…</p>
        ) : error ? (
          <p>{error}</p>
        ) : tasks.length === 0 ? (
          <p>タスクはありません</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>タスク</th>
                <th className={s.th}>プロジェクト</th>
                <th className={s.th}>ステータス</th>
                <th className={s.th}>期限日</th>
                <th className={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} onChange={handleChange} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      {remainingPages > 0 && (
        <div className={s.links}>
          <Link href="/tasks" className={s.pageLink}>
            あと {remainingPages} ページ
          </Link>
        </div>
      )}
    </div>
  );
}
