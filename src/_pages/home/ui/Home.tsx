import s from "./Home.module.scss";
import { RecentProjects } from "./RecentProjects";
import { Summary } from "./Summary";
import { TaskTable } from "./TaskTable";

export function Home() {
  return (
    <div className={s.root}>
      <h1 className={s.title}>ダッシュボード</h1>
      <div className={s.content}>
        <div className={s.project}>
          <RecentProjects />
        </div>
        <div className={s.summary}>
          <Summary />
        </div>
        <div className={s.table}>
          <TaskTable />
        </div>
      </div>
    </div>
  );
}
