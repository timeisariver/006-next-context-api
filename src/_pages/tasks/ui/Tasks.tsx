import { Suspense } from "react";
import { TasksContent } from "./TasksContent";

export function Tasks() {
  return (
    <Suspense>
      <TasksContent />
    </Suspense>
  );
}
