"use client";
import s from "./RecentProjects.module.scss";
import { Calendar, Plus, GitCommitHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import { DashboardHead } from "@/shared/ui/DashboardHead/DashboardHead";
import { MoreLink } from "@/shared/ui/MoreLink/MoreLink";
import { useContext } from "react";
import { ProjectsContext } from "@/_app/model";
import dayjs from "dayjs";

export function RecentProjects() {
  const { projects, isLoading, error } = useContext(ProjectsContext);

  return (
    <section className={s.RecentProjects}>
      <div className={s.RecentProjects__head}>
        <DashboardHead text="最近のプロジェクト" />
        <div className={s.RecentProjects__headPlus}>
          <Plus size={18} />
        </div>
      </div>
      <div className={s.RecentProjects__content}>
        {isLoading ? (
          <p>読み込み中…</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul className={s.RecentProjects__list}>
            {projects.slice(0, 3).map((project) => (
              <li key={project.id} className={s.RecentProjects__item}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={s.RecentProjects__itemLink}
                  style={
                    { "--project-color": project.color } as React.CSSProperties
                  }
                >
                  <div className={s.RecentProjects__itemInfo}>
                    <p className={s.RecentProjects__itemCategory}>
                      {project.name}
                    </p>
                    <p className={s.RecentProjects__itemDate}>
                      <Calendar size={10} />
                      <time dateTime={project.deadline}>
                        {dayjs(project.deadline).format("YYYY/MM/DD")}
                      </time>
                    </p>
                  </div>
                  <p className={s.RecentProjects__itemTitle}>{project.goal}</p>
                  <p className={s.RecentProjects__itemText}>
                    {project.shouldbe}
                  </p>
                  <div className={s.RecentProjects__itemStats}>
                    <div className={s.RecentProjects__itemStat}>
                      <GitCommitHorizontal size={12} />
                      <span className={s.RecentProjects__itemStatCount}>
                        {project.stats.kinds.milestone}
                      </span>
                    </div>
                    <div className={s.RecentProjects__itemStat}>
                      <FileText size={12} />
                      <span className={s.RecentProjects__itemStatCount}>
                        {project.stats.kinds.task}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={s.RecentProjects__links}>
        <MoreLink text="すべてのプロジェクトをみる" href="#" />
      </div>
    </section>
  );
}
