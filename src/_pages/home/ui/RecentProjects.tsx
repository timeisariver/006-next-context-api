"use client";
import clsx from "clsx";
import s from "./RecentProjects.module.scss";
import { Plus } from "lucide-react";
import { DashboardHead, MoreLink } from "@/shared/ui";
import { ProjectCard, useProjects } from "@/entities/project";

type Props = {
  className?: string;
};

export function RecentProjects({ className }: Props) {
  const { projects, isLoading, error } = useProjects();

  return (
    <section className={clsx(s.root, className)}>
      <div className={s.head}>
        <DashboardHead text="最近のプロジェクト" />
        {/* TODO: プロジェクトの追加は未実装 */}
        <button
          type="button"
          className={s.plus}
          aria-label="プロジェクトを追加"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className={s.content}>
        {isLoading ? (
          <p>読み込み中…</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul className={s.list}>
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>
        )}
      </div>
      <div className={s.links}>
        <MoreLink text="すべてのプロジェクトをみる" href="/projects" />
      </div>
    </section>
  );
}
