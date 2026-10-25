import type { TaskStatus } from "@/shared/api";
import type { SelectOption } from "@/shared/ui";

export const TASK_STATUS_OPTIONS: SelectOption<TaskStatus>[] = [
  { value: "scheduled", label: "未完了" },
  { value: "completed", label: "完了" },
  { value: "archived", label: "アーカイブ" },
];
