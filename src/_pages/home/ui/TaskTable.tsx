import { DashboardHead } from "@/shared/ui/DashboardHead/DashboardHead";
import s from "./TaskTable.module.scss";
import { MoreLink } from "@/shared/ui/MoreLink/MoreLink";

export function TaskTable() {
  return (
    <div className={s.root}>
      <div className={s.head}>
        <DashboardHead text="タスク一覧" />
        <MoreLink text="タスク一覧" href="#" />
      </div>
      <div className={s.content}></div>
    </div>
  );
}
