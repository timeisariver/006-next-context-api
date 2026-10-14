import clsx from "clsx";
import s from "./SidebarProject.module.scss";
import dayjs from "dayjs";
import Link from "next/link";
import type { Project } from "@/shared/api";

type Props = {
  project: Project;
  className?: string;
};

export function SidebarProject({ project, className }: Props) {
  return (
    <li className={clsx(s.root, className)}>
      <Link href={`/projects/${project.slug}`} className={s.link}>
        <span
          className={s.text}
          style={{ "--project-color": project.color } as React.CSSProperties}
        >
          {project.name}
        </span>
        <time className={s.time} dateTime={project.deadline}>
          {dayjs(project.deadline).format("YYYY/MM/DD")}
        </time>
      </Link>
    </li>
  );
}
