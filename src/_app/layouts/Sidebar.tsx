"use client";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import s from "./Sidebar.module.scss";
import { useProjects } from "@/entities/project";
import { SidebarProject } from "./SidebarProject";

const MENU_ITEMS = [
  { href: "/", label: "ダッシュボード", Icon: LayoutDashboard },
  { href: "/tasks", label: "タスク", Icon: ListTodo },
  { href: "/projects", label: "プロジェクト", Icon: FolderKanban },
];

/** "/" は完全一致、それ以外は配下のパス（/tasks/123 など）もアクティブとみなす */
function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  className?: string;
};

export function Sidebar({ className }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <nav className={clsx(s.root, { [s._closed]: !isOpen }, className)}>
      <button
        type="button"
        className={clsx(s.toggle, { [s._closed]: !isOpen })}
        aria-label={isOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>
      <div className={clsx(s.body, { [s._closed]: !isOpen })} inert={!isOpen}>
        <SidebarBody />
      </div>
    </nav>
  );
}

function SidebarBody() {
  const pathname = usePathname();
  const { projects, isLoading, error } = useProjects();

  return (
    <>
      <ul className={s.menu}>
        {MENU_ITEMS.map(({ href, label, Icon }) => {
          const isActive = isActivePath(pathname, href);
          return (
            <li key={href} className={s.menuItem}>
              <Link
                href={href}
                className={clsx(s.menuItemLink, {
                  [s._active]: isActive,
                })}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} />
                <span className={s.menuItemText}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {isLoading ? (
        <p>読み込み中…</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul className={s.category}>
          {projects.map((project) => (
            <SidebarProject key={project.id} project={project} />
          ))}
        </ul>
      )}
    </>
  );
}
