"use client";

import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import s from "./TaskCreateModal.module.scss";
import { useProjects } from "@/entities/project";
import { today } from "@/shared/lib";

type Props = {
  open: boolean;
  onClose: () => void;
};

const STATUSES = [
  { value: "scheduled", label: "未完了" },
  { value: "completed", label: "完了" },
  { value: "archived", label: "アーカイブ" },
];

type Errors = Partial<Record<"project" | "title" | "deadline", string>>;

export function TaskCreateModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    // 背景のクリックで閉じるのはマウス向けの補助。キーボードでは Esc（dialog 標準）と閉じるボタンで閉じられる。
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={s.root}
      aria-modal="true"
      aria-labelledby="task-create-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.scroll}>
        <button
          type="button"
          className={s.close}
          aria-label="閉じる"
          onClick={onClose}
        >
          <X />
        </button>
        {/* 開くたびにマウントし直して、入力内容を初期値に戻す */}
        {open && <TaskCreateForm onClose={onClose} />}
      </div>
    </dialog>
  );
}

function TaskCreateForm({ onClose }: { onClose: () => void }) {
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(today);
  const [status, setStatus] = useState("scheduled");
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
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      <h2 id="task-create-title" className={s.title}>
        タスクを追加
      </h2>

      <div className={s.field}>
        <label htmlFor="task-project" className={s.label}>
          プロジェクト<span className={s.required}>*</span>
        </label>
        <div className={s.selectWrap}>
          <select
            id="task-project"
            // ユーザーが開いたモーダルなので、最初の入力欄にフォーカスを移す。
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className={clsx(s.control, s.select, { [s._empty]: !projectId })}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-invalid={!!errors.project}
          >
            <option value="" disabled>
              プロジェクトを選択してください
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className={s.chevron} aria-hidden="true" />
        </div>
        {errors.project && <p className={s.error}>{errors.project}</p>}
      </div>

      <div className={s.field}>
        <label htmlFor="task-title" className={s.label}>
          タスク<span className={s.required}>*</span>
        </label>
        <input
          id="task-title"
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
        <label htmlFor="task-description" className={s.label}>
          説明・メモ
        </label>
        <textarea
          id="task-description"
          className={clsx(s.control, s.textarea)}
          placeholder="タスクの説明・メモ"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={s.field}>
        <label htmlFor="task-deadline" className={s.label}>
          締切日<span className={s.required}>*</span>
        </label>
        <input
          id="task-deadline"
          type="date"
          className={clsx(s.control, s.date)}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          aria-invalid={!!errors.deadline}
        />
        {errors.deadline && <p className={s.error}>{errors.deadline}</p>}
      </div>

      <div className={s.field}>
        <label htmlFor="task-status" className={s.label}>
          ステータス
        </label>
        <div className={s.selectWrap}>
          <select
            id="task-status"
            className={clsx(s.control, s.select)}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className={s.chevron} aria-hidden="true" />
        </div>
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
