"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProjects } from "@/entities/project";
import { TaskTable } from "@/entities/task";
import { getTasks, type PageInfo, type Task } from "@/shared/api";
import { buildHref, parseLimit, parsePage } from "../lib/params";
import { LimitSelect } from "./LimitSelect";
import { Pagination } from "./Pagination";
import s from "./TasksContent.module.scss";

type Result = {
  key: string;
  tasks: Task[];
  pageInfo: PageInfo | null;
  error: string | null;
};

export function TasksContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { projects } = useProjects();

  const limit = parseLimit(searchParams.get("limit"));
  const page = parsePage(searchParams.get("page"));
  const key = `${limit}:${page}`;

  // 最後に取得できた結果。key が今の URL と違うあいだは読み込み中として扱う
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resultKey = `${limit}:${page}`;
      try {
        const { tasks, pageInfo } = await getTasks({ limit, page });
        if (cancelled) return;
        const totalPages = Math.max(1, Math.ceil(pageInfo.totalCount / limit));
        if (page > totalPages) {
          // 範囲外のページは 1 ページ目として表示する
          router.replace(buildHref(pathname, 1, limit));
          return;
        }
        setResult({ key: resultKey, tasks, pageInfo, error: null });
      } catch {
        if (cancelled) return;
        setResult((prev) => ({
          key: resultKey,
          tasks: [],
          pageInfo: prev?.pageInfo ?? null,
          error: "読み込みに失敗しました",
        }));
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [limit, page, pathname, router]);

  function handleChange(updated: Task) {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === updated.id ? updated : task,
            ),
          }
        : prev,
    );
  }

  const totalCount = result?.pageInfo?.totalCount ?? null;
  const totalPages =
    totalCount === null ? null : Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className={s.root}>
      <h1 className={s.title}>タスク</h1>
      {totalCount !== null && totalPages !== null && (
        <div className={s.summary}>
          <span>
            {Math.min(page, totalPages)} / {totalPages}
          </span>
          <span className={s.limit}>
            <label htmlFor="tasks-limit">表示件数：</label>
            <LimitSelect
              id="tasks-limit"
              value={limit}
              onChange={(next) => router.push(buildHref(pathname, 1, next))}
            />
          </span>
          <span>{totalCount} 件</span>
        </div>
      )}
      <div className={s.content}>
        {result === null || result.key !== key ? (
          <p>読み込み中…</p>
        ) : result.error ? (
          <p>{result.error}</p>
        ) : result.tasks.length === 0 ? (
          <p>タスクはありません</p>
        ) : (
          <TaskTable
            tasks={result.tasks}
            projects={projects}
            onChange={handleChange}
          />
        )}
      </div>
      {totalPages !== null && totalPages > 1 && (
        <Pagination
          className={s.pagination}
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onSelect={(next) => router.push(buildHref(pathname, next, limit))}
        />
      )}
    </div>
  );
}
