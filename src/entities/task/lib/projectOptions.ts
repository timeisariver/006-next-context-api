import type { Project } from "@/shared/api";

// プロジェクトのプルダウンの選択肢。
// current を渡すと、プロジェクト一覧の取得前・失敗時も、タスクが今属しているプロジェクトを選択肢に残す
export function toProjectOptions(
  projects: Project[],
  current?: Project,
): { value: string; label: string }[] {
  const withCurrent =
    !current || projects.some((project) => project.id === current.id)
      ? projects
      : [current, ...projects];
  return withCurrent.map((project) => ({
    value: project.id,
    label: project.name,
  }));
}
