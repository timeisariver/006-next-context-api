import s from "./RecentProject.module.scss";
import { Calendar, GitCommitHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import type { Project } from "@/shared/api";

export function RecentProject({ project }: { project: Project }) {
  return (
    <li className={s.root}>
      <Link
        href={`/projects/${project.slug}`}
        className={s.link}
        style={{ "--project-color": project.color } as React.CSSProperties}
      >
        <div className={s.info}>
          <p className={s.category}>{project.name}</p>
          <p className={s.date}>
            <Calendar size={10} />
            <time dateTime={project.deadline}>
              {dayjs(project.deadline).format("YYYY/MM/DD")}
            </time>
          </p>
        </div>
        <p className={s.title}>{project.goal}</p>
        <p className={s.text}>{project.shouldbe}</p>
        <div className={s.stats}>
          <div className={s.stat}>
            <GitCommitHorizontal size={12} />
            <span className={s.statCount}>{project.stats.kinds.milestone}</span>
          </div>
          <div className={s.stat}>
            <FileText size={12} />
            <span className={s.statCount}>{project.stats.kinds.task}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
