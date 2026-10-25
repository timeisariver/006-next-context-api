// RootLayout（Server Component）が @/entities/project を import するため、ここで境界を切る。
// 付けないと @/shared/lib 経由で useFetch（useEffectEvent）が Server Component 側に入る
"use client";

import clsx from "clsx";
import s from "./ProjectCard.module.scss";
import { Calendar, GitCommitHorizontal, FileText } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/shared/api";
import { formatDate } from "@/shared/lib";
import { projectColorStyle } from "../lib/projectColor";

type Props = {
  project: Project;
  className?: string;
};

export function ProjectCard({ project, className }: Props) {
  return (
    <li className={clsx(s.root, className)}>
      <Link
        href={`/projects/${project.slug}`}
        className={s.link}
        style={projectColorStyle(project.color)}
      >
        <div className={s.info}>
          <p className={s.name}>{project.name}</p>
          <p className={s.date}>
            <Calendar size={12} />
            <time dateTime={project.deadline}>
              {formatDate(project.deadline)}
            </time>
          </p>
        </div>
        <p className={s.goal}>{project.goal}</p>
        <p className={s.shouldbe}>{project.shouldbe}</p>
        <div className={s.stats}>
          <div className={s.stat}>
            <GitCommitHorizontal size={14} />
            <span className={s.statCount}>{project.stats.kinds.milestone}</span>
          </div>
          <div className={s.stat}>
            <FileText size={14} />
            <span className={s.statCount}>{project.stats.kinds.task}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
