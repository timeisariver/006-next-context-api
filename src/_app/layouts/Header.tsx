"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import s from "./Header.module.scss";
import { HeaderSearch } from "./HeaderSearch";
import { TaskCreateForm } from "./TaskCreateForm";
import { Toast } from "./Toast";
import { Bell, Info, Plus, User } from "lucide-react";
import { useTaskChanges } from "@/entities/task";
import { useModal } from "@/shared/lib";
import { Modal } from "@/shared/ui";

type Props = {
  className?: string;
};

// TODO: ヘルプ・通知の動作は未実装
const ACTIONS = [
  { label: "ヘルプ", Icon: Info },
  { label: "通知", Icon: Bell },
];

// 画面の右下に出す知らせ。id は連番で、置き換えたときに 5 秒を数え直すため key に使う
type ToastState = {
  id: number;
  message: string;
  tone: "success" | "error";
};

export function Header({ className }: Props) {
  const taskModal = useModal();
  const { notifyTasksChanged } = useTaskChanges();
  const [toast, setToast] = useState<ToastState | null>(null);

  function showToast(message: string, tone: ToastState["tone"]) {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, tone }));
  }

  function handleCreated() {
    notifyTasksChanged();
    showToast("タスクを作成しました", "success");
  }

  function handleCreateFailed() {
    showToast("タスクの作成に失敗しました", "error");
  }

  // トーストは画面全体への知らせなので、<header>（banner ランドマーク）の外に置く
  return (
    <>
      <header className={clsx(s.root, className)}>
        <div className={s.left}>
          <Link href="/" className={s.logo}>
            Turvo
          </Link>
          <HeaderSearch />
        </div>
        <ul className={s.actions}>
          <li>
            <button
              type="button"
              className={s.action}
              aria-label="タスクを追加"
              onClick={taskModal.open}
            >
              <Plus />
            </button>
          </li>
          {ACTIONS.map(({ label, Icon }) => (
            <li key={label}>
              <button type="button" className={s.action} aria-label={label}>
                <Icon />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={clsx(s.action, s.avatar)}
              aria-label="アカウント"
            >
              <User className={s.avatarIcon} />
            </button>
          </li>
        </ul>
        <Modal
          open={taskModal.isOpen}
          onClose={taskModal.close}
          title="タスクを追加"
        >
          <TaskCreateForm
            onClose={taskModal.close}
            onCreated={handleCreated}
            onCreateFailed={handleCreateFailed}
          />
        </Modal>
      </header>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
