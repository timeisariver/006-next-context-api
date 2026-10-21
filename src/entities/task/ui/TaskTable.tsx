import clsx from "clsx";
import type { Project, Task } from "@/shared/api";
import { TaskRow } from "./TaskRow";
import s from "./TaskTable.module.scss";

type Props = {
  tasks: Task[];
  projects: Project[];
  onChange: (task: Task) => void;
  className?: string;
};

export function TaskTable({ tasks, projects, onChange, className }: Props) {
  return (
    <table className={clsx(s.table, className)}>
      <thead>
        <tr>
          <th className={clsx(s.th, s.thTitle)}>タスク</th>
          <th className={clsx(s.th, s.thFit)}>プロジェクト</th>
          <th className={clsx(s.th, s.thFit)}>ステータス</th>
          <th className={clsx(s.th, s.thFit)}>期限日</th>
          <th className={s.th}></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            projects={projects}
            onChange={onChange}
          />
        ))}
      </tbody>
    </table>
  );
}
