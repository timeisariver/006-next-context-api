"use client";
import clsx from "clsx";
import { usePathname, useSearchParams } from "next/navigation";
import s from "./ProjectList.module.scss";
import { ProjectCard, useProjects } from "@/entities/project";
import { parsePage } from "@/shared/lib";
import { Pagination } from "@/shared/ui";

const PAGE_SIZE = 10;

type Props = {
  className?: string;
};

export function ProjectList({ className }: Props) {
  const { projects, isLoading, error } = useProjects();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (isLoading) return <p className={s.message}>読み込み中…</p>;
  if (error) return <p className={s.message}>{error}</p>;
  if (projects.length === 0) {
    return <p className={s.message}>プロジェクトがありません</p>;
  }

  const totalPages = Math.ceil(projects.length / PAGE_SIZE);
  const parsed = parsePage(searchParams.get("page"));
  const page = parsed <= totalPages ? parsed : 1;
  const start = (page - 1) * PAGE_SIZE;

  return (
    <div className={clsx(s.root, className)}>
      <p className={s.count}>
        {page} / {totalPages} ({projects.length} 件)
      </p>
      <ul className={s.list}>
        {projects.slice(start, start + PAGE_SIZE).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={totalPages}
        getHref={(n) => (n === 1 ? pathname : `${pathname}?page=${n}`)}
        className={s.pagination}
      />
    </div>
  );
}
