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
              <li key={project.id} className={s.item}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={s.link}
                  style={
                    { "--project-color": project.color } as React.CSSProperties
                  }
                >
                  <div className={s.info}>
                    <p className={s.category}>
                      {project.name}
                    </p>
                    <p className={s.date}>
                      <Calendar size={10} />
                      <time dateTime={project.deadline}>
                        {dayjs(project.deadline).format("YYYY/MM/DD")}
                      </time>
                    </p>
                  </div>
                  <p className={s.title}>{project.goal}</p>
                  <p className={s.text}>
                    {project.shouldbe}
                  </p>
                  <div className={s.stats}>
                    <div className={s.stat}>
                      <GitCommitHorizontal size={12} />
                      <span className={s.statCount}>
                        {project.stats.kinds.milestone}
                      </span>
                    </div>
                    <div className={s.stat}>
                      <FileText size={12} />
                      <span className={s.statCount}>
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
      <div className={s.links}>
        <MoreLink text="すべてのプロジェクトをみる" href="#" />
      </div>
    </section>
  );
}
