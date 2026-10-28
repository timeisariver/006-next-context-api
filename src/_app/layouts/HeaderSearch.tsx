"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRef, useState } from "react";
import s from "./HeaderSearch.module.scss";
import { Search, X } from "lucide-react";
import { getAllTasks, type Task } from "@/shared/api";
import { toDateString, toDisplay } from "@/shared/lib";

type Props = {
  className?: string;
};

// 取得した結果。成功したときだけ tasks を持つ
type Result = { ok: true; tasks: Task[] } | { ok: false };

const MAX_RESULTS = 10;

// 大文字・小文字、全角・半角（英数字・カタカナ）を区別しないよう揃える
function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase();
}

// タイトルにキーワードを含むタスクを、期限日の昇順（同じ日はタイトルの自然順）で先頭から 10 件返す
function searchTasks(tasks: Task[], keyword: string) {
  const target = normalize(keyword);
  return tasks
    .filter((task) => normalize(task.title).includes(target))
    .sort((a, b) => {
      const byDeadline = toDateString(a.deadline).localeCompare(
        toDateString(b.deadline),
      );
      if (byDeadline !== 0) return byDeadline;
      return a.title.localeCompare(b.title, "ja", { numeric: true });
    })
    .slice(0, MAX_RESULTS);
}

export function HeaderSearch({ className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // 取得結果。null のあいだはまだ一度も取得できていない（取り直しのあいだは前の結果のまま）
  const [result, setResult] = useState<Result | null>(null);
  // 続けて取得したときに、古い取得の結果で上書きしないための連番
  const requestIdRef = useRef(0);

  const keyword = query.trim();
  const isVisible = isOpen && keyword !== "";

  async function load() {
    const requestId = ++requestIdRef.current;
    try {
      const tasks = await getAllTasks();
      if (requestId === requestIdRef.current) setResult({ ok: true, tasks });
    } catch {
      if (requestId === requestIdRef.current) setResult({ ok: false });
    }
  }

  // 一覧が閉じた状態から開くときだけ取得する（開いているあいだの入力では取得しない）
  function update(nextQuery: string, nextIsOpen: boolean) {
    setQuery(nextQuery);
    setIsOpen(nextIsOpen);
    if (!isVisible && nextIsOpen && nextQuery.trim() !== "") load();
  }

  function handleFocus() {
    if (isOpen) return;
    update(query, true);
  }

  // フォーカスを先に入力欄へ移してから閉じる（移したときの handleFocus で開き直さないように）
  function closeAndFocusInput() {
    inputRef.current?.focus();
    setIsOpen(false);
  }

  function handleClear() {
    inputRef.current?.focus();
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeAndFocusInput();
  }

  // 検索欄と一覧の外へフォーカスが移ったら閉じる（外側のクリック・Tab で出たとき）
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
  }

  return (
    // onBlur は子要素からのフォーカスの移動を受けるだけで、この div 自体は操作の対象ではない
    <div className={clsx(s.root, className)} onBlur={handleBlur}>
      <Search className={s.icon} />
      <input
        ref={inputRef}
        type="text"
        placeholder="タスクタイトルで検索"
        aria-label="タスクタイトルで検索"
        className={s.input}
        value={query}
        onChange={(e) => update(e.target.value, true)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      {query !== "" && (
        <button
          type="button"
          className={s.clear}
          aria-label="検索をクリア"
          onClick={handleClear}
        >
          <X className={s.clearIcon} />
        </button>
      )}
      {isVisible && (
        <div className={s.panel}>
          {result === null ? (
            <p className={s.message}>読み込み中…</p>
          ) : !result.ok ? (
            <p className={s.message}>読み込みに失敗しました</p>
          ) : (
            <SearchResults
              tasks={searchTasks(result.tasks, keyword)}
              onSelect={() => setIsOpen(false)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
      )}
    </div>
  );
}

type SearchResultsProps = {
  tasks: Task[];
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

function SearchResults({ tasks, onSelect, onKeyDown }: SearchResultsProps) {
  if (tasks.length === 0) {
    return <p className={s.message}>一致するタスクはありません</p>;
  }
  return (
    <ul className={s.list}>
      {tasks.map((task) => (
        <li key={task.id}>
          <Link
            href={`/tasks/${task.id}`}
            className={s.item}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            // 押したときに入力欄からフォーカスを外さない。Safari はリンクを押してもフォーカスを
            // 移さないため、外さないと onBlur で一覧が閉じ、click が届かずに移動できない
            onMouseDown={(e) => e.preventDefault()}
          >
            <span className={s.title}>{task.title}</span>
            <span className={s.meta}>
              <span>{task.project.name}</span>
              <span>{toDisplay(task.deadline)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
