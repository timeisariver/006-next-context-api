"use client";
import clsx from "clsx";
import {
  ChevronLeft,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const { projects, isLoading, error } = useProjects();

  return (
    <nav className={clsx(s.root, className)}>
      {/* TODO: サイドバーの開閉は未実装 */}
      <button
        type="button"
        className={s.toggle}
        aria-label="サイドバーを閉じる"
      >
        <ChevronLeft size={24} />
      </button>
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
    </nav>
  );
}
