"use client";
import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import {
  updateTask,
  type Project,
  type Task,
  type UpdateTaskBody,
} from "@/shared/api";
import { Select } from "@/shared/ui";
import { withCurrentProject } from "../lib/projectOptions";
import { TASK_STATUS_OPTIONS } from "../model/status";
import { DeadlineCell } from "./DeadlineCell";
import s from "./TaskRow.module.scss";

type Field = "project" | "status" | "deadline";

type Props = {
  task: Task;
  projects: Project[];
  onChange: (task: Task) => void;
};

export function TaskRow({ task, projects, onChange }: Props) {
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
        <Select
          size="small"
          className={s.select}
          aria-label="プロジェクト"
          options={withCurrentProject(projects, task.project).map(
            (project) => ({ value: project.id, label: project.name }),
          )}
          value={task.project.id}
          disabled={savingField === "project"}
          onChange={(projectId) => save("project", { projectId })}
        />
      </td>
      <td className={s.cell}>
        <Select
          size="small"
          className={s.select}
          aria-label="ステータス"
          options={TASK_STATUS_OPTIONS}
          value={task.status}
          disabled={savingField === "status"}
          onChange={(status) => save("status", { status })}
        />
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
