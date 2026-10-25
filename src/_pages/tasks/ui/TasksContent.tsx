"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProjects } from "@/entities/project";
import { TaskTable } from "@/entities/task";
import { getTasks, type Task } from "@/shared/api";
import { buildHref, parseLimit, parsePage } from "../lib/params";
import { LimitSelect } from "./LimitSelect";
import { Pagination } from "./Pagination";
import s from "./TasksContent.module.scss";

type Result = {
  key: string;
  tasks: Task[];
  error: string | null;
};

// 全件数と、その件数を取得したときの表示件数。表示件数を変えた直後も、取得が終わるまでは
// 前の組み合わせのまま表示し、新しい表示件数と前の全件数が混ざらないようにする
type Counts = {
  totalCount: number;
  limit: number;
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
  // 最後に取得できた件数。取得に失敗しても残す
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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
        setCounts({ totalCount: pageInfo.totalCount, limit });
        setResult({ key: resultKey, tasks, error: null });
      } catch {
        if (cancelled) return;
        setResult({
          key: resultKey,
          tasks: [],
          error: "読み込みに失敗しました",
        });
      }
    }

    load();

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

  const totalCount = counts?.totalCount ?? null;
  const totalPages =
    counts === null
      ? null
      : Math.max(1, Math.ceil(counts.totalCount / counts.limit));

  return (
    <div className={s.root}>
      <h1 className={s.title}>タスク</h1>
      <div className={s.summary}>
        <span>
          {totalPages === null ? "-" : Math.min(page, totalPages)} /{" "}
          {totalPages ?? "-"}
        </span>
        <span className={s.limit}>
          <label id="tasks-limit-label" htmlFor="tasks-limit">
            表示件数：
          </label>
          <LimitSelect
            id="tasks-limit"
            labelId="tasks-limit-label"
            value={limit}
            onChange={(next) => router.push(buildHref(pathname, 1, next))}
          />
        </span>
        <span>{totalCount ?? "-"} 件</span>
      </div>
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
