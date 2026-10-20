import { TaskDetail } from "@/_pages/task-detail";

export default async function Page({ params }: PageProps<"/tasks/[id]">) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
