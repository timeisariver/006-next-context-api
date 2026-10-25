import type { TaskStatus } from "@/shared/api";

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "scheduled", label: "未完了" },
  { value: "completed", label: "完了" },
  { value: "archived", label: "アーカイブ" },
];
