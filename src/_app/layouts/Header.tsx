"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import s from "./Header.module.scss";
import { TaskCreateModal } from "./TaskCreateModal";
import { Search, Bell, Info, Plus, User } from "lucide-react";

type Props = {
  className?: string;
};

// TODO: ヘルプ・通知の動作は未実装
const ACTIONS = [
  { label: "ヘルプ", Icon: Info },
  { label: "通知", Icon: Bell },
];

export function Header({ className }: Props) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <header className={clsx(s.root, className)}>
      <div className={s.left}>
        <Link href="/" className={s.logo}>
          Turvo
        </Link>
        <div className={s.search}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="タスクタイトルで検索"
            aria-label="タスクタイトルで検索"
            className={s.searchInput}
          />
        </div>
      </div>
      <ul className={s.actions}>
        <li>
          <button
            type="button"
            className={s.action}
            aria-label="タスクを追加"
            onClick={() => setIsTaskModalOpen(true)}
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
            <User />
          </button>
        </li>
      </ul>
      <TaskCreateModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </header>
  );
}
