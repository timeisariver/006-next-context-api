"use client";

import clsx from "clsx";
import { useId, useState } from "react";
import s from "./TaskCreateForm.module.scss";
import { useProjects } from "@/entities/project";
import { TASK_STATUS_OPTIONS, toProjectOptions } from "@/entities/task";
import type { TaskStatus } from "@/shared/api";
import { today } from "@/shared/lib";
import { Select } from "@/shared/ui";

type Props = {
  onClose: () => void;
};

type Errors = Partial<Record<"project" | "title" | "deadline", string>>;

export function TaskCreateForm({ onClose }: Props) {
  const formId = useId();
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(today);
  const [status, setStatus] = useState<TaskStatus>("scheduled");
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!projectId) next.project = "プロジェクトを選択してください";
    if (!title.trim()) next.title = "タスクを入力してください";
    if (!deadline) next.deadline = "締切日を入力してください";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // 見た目だけの実装のため、API には送らず閉じるだけにする
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={s.field}>
        <label
          id={`${formId}-project-label`}
          htmlFor={`${formId}-project`}
          className={s.label}
        >
          プロジェクト<span className={s.required}>*</span>
        </label>
        <Select
          id={`${formId}-project`}
          aria-labelledby={`${formId}-project-label`}
          // ユーザーが開いたモーダルなので、最初の入力欄にフォーカスを移す。
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          placeholder="プロジェクトを選択してください"
          options={toProjectOptions(projects)}
          value={projectId || null}
          onChange={setProjectId}
          invalid={!!errors.project}
        />
        {errors.project && <p className={s.error}>{errors.project}</p>}
      </div>

      <div className={s.field}>
        <label htmlFor={`${formId}-title`} className={s.label}>
          タスク<span className={s.required}>*</span>
        </label>
        <input
          id={`${formId}-title`}
          type="text"
          className={s.control}
          placeholder="タスクを入力。 例）英会話レッスンの予約、React公式ドキュメントを1ページ読む"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className={s.error}>{errors.title}</p>}
      </div>

      <div className={s.field}>
        <label htmlFor={`${formId}-description`} className={s.label}>
          説明・メモ
        </label>
        <textarea
          id={`${formId}-description`}
          className={clsx(s.control, s.textarea)}
          placeholder="タスクの説明・メモ"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={s.field}>
        <label htmlFor={`${formId}-deadline`} className={s.label}>
          締切日<span className={s.required}>*</span>
        </label>
        <input
          id={`${formId}-deadline`}
          type="date"
          className={clsx(s.control, s.date)}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          aria-invalid={!!errors.deadline}
        />
        {errors.deadline && <p className={s.error}>{errors.deadline}</p>}
      </div>

      <div className={s.field}>
        <label
          id={`${formId}-status-label`}
          htmlFor={`${formId}-status`}
          className={s.label}
        >
          ステータス
        </label>
        <Select
          id={`${formId}-status`}
          aria-labelledby={`${formId}-status-label`}
          options={TASK_STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
      </div>

      <div className={s.buttons}>
        <button type="submit" className={clsx(s.button, s.submit)}>
          作成
        </button>
        <button
          type="button"
          className={clsx(s.button, s.cancel)}
          onClick={onClose}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
