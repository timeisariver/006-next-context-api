import s from "./Home.module.scss";
import { RecentProjects } from "./RecentProjects";
import { Summary } from "./Summary";
import { TaskTable } from "./TaskTable";

export function Home() {
  return (
    <div className={s.Home}>
      <h1 className={s.Home__title}>ダッシュボード</h1>
      <div className={s.Home__content}>
        <div className={s.Home__project}>
          <RecentProjects />
        </div>
        <div className={s.Home__summary}>
          <Summary />
        </div>
        <div className={s.Home__table}>
          <TaskTable />
        </div>
      </div>
    </div>
  );
}
