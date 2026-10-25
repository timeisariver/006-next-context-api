import type { Project } from "@/shared/api";

// プロジェクト一覧の取得前・失敗時も、タスクが今属しているプロジェクトを選択肢に残す
export function withCurrentProject(
  projects: Project[],
  current: Project,
): Project[] {
  return projects.some((project) => project.id === current.id)
    ? projects
    : [current, ...projects];
}
