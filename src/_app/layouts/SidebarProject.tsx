import clsx from "clsx";
import s from "./SidebarProject.module.scss";
import Link from "next/link";
import type { Project } from "@/shared/api";
import { formatDate } from "@/shared/lib";

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
          {formatDate(project.deadline)}
        </time>
      </Link>
    </li>
  );
}
