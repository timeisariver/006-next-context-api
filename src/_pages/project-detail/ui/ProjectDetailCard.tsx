import clsx from "clsx";
import dayjs from "dayjs";
import { Archive, Calendar, Check } from "lucide-react";
import type { Project } from "@/shared/api";
import s from "./ProjectDetailCard.module.scss";

type Props = {
  project: Project;
  className?: string;
};

function formatRemaining(deadline: string) {
  const days = dayjs(deadline)
    .startOf("day")
    .diff(dayjs().startOf("day"), "day");
  if (days > 0) return `あと ${days} 日`;
  if (days === 0) return "今日まで";
  return `${-days} 日超過`;
}

export function ProjectDetailCard({ project, className }: Props) {
  const { scheduled, completed, archived } = project.stats.states;

  return (
    <section
      className={clsx(s.root, className)}
      style={{ "--project-color": project.color } as React.CSSProperties}
    >
      <h1 className={s.name}>{project.name}</h1>
      <div className={s.row}>
        <span className={s.label}>ゴール:</span>
        <div className={s.value}>
          <p className={s.deadline}>
            {formatRemaining(project.deadline)} (
            <time dateTime={project.deadline}>
              {dayjs(project.deadline).format("YYYY/MM/DD")}
            </time>
            )
          </p>
          <p className={s.goal}>{project.goal}</p>
        </div>
      </div>
      <div className={s.row}>
        <span className={s.label}>あるべき姿:</span>
        <p className={clsx(s.value, s.shouldbe)}>{project.shouldbe}</p>
      </div>
      <hr className={s.divider} />
      <div className={s.row}>
        <label className={s.label} htmlFor="project-slug">
          スラッグ:
        </label>
        <div className={s.value}>
          <div className={s.slugField}>
            <span className={s.slugPrefix}>/projects/</span>
            <input
              id="project-slug"
              className={s.slugInput}
              value={project.slug}
              readOnly
            />
          </div>
        </div>
      </div>
      <ul className={s.stats}>
        <li className={s.stat}>
          <Calendar size={24} aria-hidden />
          <span className={s.statCount}>{scheduled}</span>
        </li>
        <li className={s.stat}>
          <Check size={24} aria-hidden />
          <span className={s.statCount}>{completed}</span>
        </li>
        <li className={s.stat}>
          <Archive size={24} aria-hidden />
          <span className={s.statCount}>{archived}</span>
        </li>
      </ul>
    </section>
  );
}
