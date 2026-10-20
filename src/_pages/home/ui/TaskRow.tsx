"use client";
import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { useProjects } from "@/entities/project";
import {
  updateTask,
  type Task,
  type TaskStatus,
  type UpdateTaskBody,
} from "@/shared/api";
import { DeadlineCell } from "./DeadlineCell";
import s from "./TaskRow.module.scss";

type Field = "project" | "status" | "deadline";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "scheduled", label: "未完了" },
  { value: "completed", label: "完了" },
  { value: "archived", label: "アーカイブ" },
];

type Props = {
  task: Task;
  onChange: (task: Task) => void;
};

export function TaskRow({ task, onChange }: Props) {
  const { projects } = useProjects();
  const [savingField, setSavingField] = useState<Field | null>(null);
  const [hasError, setHasError] = useState(false);

  async function save(field: Field, body: UpdateTaskBody) {
    setSavingField(field);
    setHasError(false);
    try {
      const updated = await updateTask(task.id, body);
      onChange({ ...task, ...updated });
    } catch {
      setHasError(true);
    } finally {
      setSavingField(null);
    }
  }

  return (
    <tr className={s.root}>
      <td className={clsx(s.cell, s.cellTitle)}>
        <span className={s.title}>{task.title}</span>
        {hasError && (
          <p className={s.error} role="alert">
            保存に失敗しました
          </p>
        )}
      </td>
      <td className={s.cell}>
        <select
          className={s.select}
          aria-label="プロジェクト"
          value={task.project.id}
          disabled={savingField === "project"}
          onChange={(e) => save("project", { projectId: e.target.value })}
        >
          {/* プロジェクト一覧の取得前・失敗時も、今のプロジェクトを選択肢に残す */}
          {!projects.some((project) => project.id === task.project.id) && (
            <option value={task.project.id}>{task.project.name}</option>
          )}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </td>
      <td className={s.cell}>
        <select
          className={s.select}
          aria-label="ステータス"
          value={task.status}
          disabled={savingField === "status"}
          onChange={(e) =>
            save("status", { status: e.target.value as TaskStatus })
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td className={s.cell}>
        <DeadlineCell
          deadline={task.deadline}
          disabled={savingField === "deadline"}
          onSave={(deadline) => save("deadline", { deadline })}
        />
      </td>
      <td className={s.cell}>
        <Link
          href={`/tasks/${task.id}`}
          className={s.link}
          aria-label={`${task.title}の詳細をみる`}
        >
          <span className={s.linkText}>詳細</span>
          <MoveRight size={16} />
        </Link>
      </td>
    </tr>
  );
}
