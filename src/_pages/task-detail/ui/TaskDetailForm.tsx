"use client";
import { useId, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import s from "./TaskDetailForm.module.scss";
import {
  deleteTask,
  updateTask,
  type Task,
  type TaskStatus,
} from "@/shared/api";
import { toDateString, toDisplay } from "@/shared/lib";
import { Select } from "@/shared/ui";
import { useProjects } from "@/entities/project";
import { TASK_STATUS_OPTIONS, toProjectOptions } from "@/entities/task";

type Props = {
  initialTask: Task;
  className?: string;
};

export function TaskDetailForm({ initialTask, className }: Props) {
  const router = useRouter();
  const { projects, refreshProjects } = useProjects();
  const formId = useId();

  // 最後に保存した（または読み込んだ）値
  const [saved, setSaved] = useState(initialTask);
  const projectOptions = toProjectOptions(projects, saved.project);
  // 入力中の値
  const [projectId, setProjectId] = useState(initialTask.project.id);
  const [deadline, setDeadline] = useState(toDateString(initialTask.deadline));
  const [status, setStatus] = useState<TaskStatus>(initialTask.status);
  const [description, setDescription] = useState(initialTask.description);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = isSaving || isDeleting;

  function applyTask(task: Task) {
    setSaved(task);
    setProjectId(task.project.id);
    setDeadline(toDateString(task.deadline));
    setStatus(task.status);
    setDescription(task.description);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBusy || !deadline) return;
    setIsSaving(true);
    setError(null);
    try {
      const task = await updateTask(saved.id, {
        projectId,
        deadline,
        status,
        description,
      });
      applyTask(task);
      void refreshProjects();
    } catch {
      setError("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    applyTask(saved);
    setError(null);
  }

  async function handleDelete() {
    if (isBusy) return;
    if (!window.confirm("このタスクを削除しますか？")) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTask(saved.id);
      void refreshProjects();
      router.push("/tasks");
    } catch {
      setError("削除に失敗しました");
      setIsDeleting(false);
    }
  }

  return (
    <div className={clsx(s.root, className)}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>{saved.title}</h1>
          <p className={s.dates}>
            作成日時: {toDisplay(saved.createdAt)}　更新日時:{" "}
            {toDisplay(saved.updatedAt)}
          </p>
        </div>
        <button
          type="button"
          className={s.trash}
          aria-label="タスクを削除"
          disabled={isBusy}
          onClick={handleDelete}
        >
          <Trash2 size={20} />
        </button>
      </div>

      <form className={s.form} onSubmit={handleSubmit}>
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
            options={projectOptions}
            value={projectId}
            disabled={isBusy}
            onChange={setProjectId}
          />
        </div>

        <div className={s.field}>
          <label htmlFor={`${formId}-deadline`} className={s.label}>
            締切日<span className={s.required}>*</span>
          </label>
          <input
            id={`${formId}-deadline`}
            type="date"
            className={s.control}
            value={deadline}
            required
            disabled={isBusy}
            onChange={(e) => setDeadline(e.target.value)}
          />
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
            disabled={isBusy}
            onChange={setStatus}
          />
        </div>

        <div className={s.field}>
          <label htmlFor={`${formId}-description`} className={s.label}>
            説明・メモ
          </label>
          <textarea
            id={`${formId}-description`}
            className={clsx(s.control, s.textarea)}
            value={description}
            placeholder="タスクの説明・メモ"
            disabled={isBusy}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}

        <div className={s.buttons}>
          <button
            type="submit"
            className={clsx(s.button, s.update)}
            disabled={isBusy}
          >
            更新
          </button>
          <button
            type="button"
            className={clsx(s.button, s.reset)}
            disabled={isBusy}
            onClick={handleReset}
          >
            リセット
          </button>
        </div>
      </form>

      <Link href="/tasks" className={s.back}>
        <ArrowLeft size={16} />
        戻る
      </Link>
    </div>
  );
}
