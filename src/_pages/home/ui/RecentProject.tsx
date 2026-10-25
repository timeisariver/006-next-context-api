import clsx from "clsx";
import s from "./RecentProject.module.scss";
import { Calendar, GitCommitHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/shared/api";
import { formatDate } from "@/shared/lib";

type Props = {
  project: Project;
  className?: string;
};

export function RecentProject({ project, className }: Props) {
  return (
    <li className={clsx(s.root, className)}>
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
              {formatDate(project.deadline)}
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
