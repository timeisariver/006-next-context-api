import clsx from "clsx";
import { DashboardHead, MoreLink } from "@/shared/ui";
import s from "./TaskTable.module.scss";

type Props = {
  className?: string;
};

export function TaskTable({ className }: Props) {
  return (
    <div className={clsx(s.root, className)}>
      <div className={s.head}>
        <DashboardHead text="タスク一覧" />
        <MoreLink text="すべてのタスクをみる" href="/tasks" />
      </div>
      <div className={s.content}></div>
    </div>
  );
}
