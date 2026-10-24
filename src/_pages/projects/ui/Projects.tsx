import { Suspense } from "react";
import clsx from "clsx";
import s from "./Projects.module.scss";
import { ProjectList } from "./ProjectList";

type Props = {
  className?: string;
};

export function Projects({ className }: Props) {
  return (
    <div className={clsx(s.root, className)}>
      <h1 className={s.title}>プロジェクト</h1>
      <Suspense fallback={<p className={s.message}>読み込み中…</p>}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
