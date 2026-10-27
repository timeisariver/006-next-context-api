"use client";

import { createContext, useState } from "react";

type TaskChangesValue = {
  // タスクを作成するたびに 1 増える
  revision: number;
  notifyTasksChanged: () => void;
};

export const TaskChangesContext = createContext<TaskChangesValue>({
  revision: 0,
  notifyTasksChanged: () => {},
});

export function TaskChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [revision, setRevision] = useState(0);

  function notifyTasksChanged() {
    setRevision((prev) => prev + 1);
  }

  return (
    <TaskChangesContext value={{ revision, notifyTasksChanged }}>
      {children}
    </TaskChangesContext>
  );
}
