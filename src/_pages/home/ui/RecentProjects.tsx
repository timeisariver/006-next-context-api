"use client";
import s from "./RecentProjects.module.scss";
import { Plus } from "lucide-react";
import { DashboardHead } from "@/shared/ui/DashboardHead/DashboardHead";
import { MoreLink } from "@/shared/ui/MoreLink/MoreLink";
import { useProjects } from "@/entities/project";
import { RecentProject } from "./RecentProject";

export function RecentProjects() {
  const { projects, isLoading, error } = useProjects();

  return (
    <section className={s.root}>
      <div className={s.head}>
        <DashboardHead text="最近のプロジェクト" />
        <div className={s.plus}>
          <Plus size={18} />
        </div>
      </div>
      <div className={s.content}>
        {isLoading ? (
          <p>読み込み中…</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul className={s.list}>
            {projects.slice(0, 3).map((project) => (
              <RecentProject key={project.id} project={project} />
            ))}
          </ul>
        )}
      </div>
      <div className={s.links}>
        <MoreLink text="すべてのプロジェクトをみる" href="#" />
      </div>
    </section>
  );
}
