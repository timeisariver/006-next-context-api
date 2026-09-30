import { NextResponse } from "next/server";
import dayjs from "dayjs";
import { getTasks, setTasks } from "../../../../datastore";
import { factory } from "../../../../datastore/models";
import { notFound } from "../../../../lib/renderer";

export async function GET(_, context) {
  const { id } = await context.params;

  const task = getTasks().find((it) => {
    return it.id === id;
  });

  if (!task) {
    return notFound();
  }

  return NextResponse.json({
    data: task,
  });
}

export async function PATCH(request, context) {
  const { id } = await context.params;
  const params = await request.json();

  const tasks = getTasks();
  const index = tasks.findIndex((it) => it.id === id);
  if (index == -1) {
    return NextResponse.json(
      {
        message: "Not found",
      },
      {
        status: 404,
      },
    );
  }

  const task = factory.task(tasks[index]).assign({
    ...params,
    updatedAt: dayjs().format(),
  });
  const error = task.validate();
  if (error) {
    return notFound();
  }

  tasks[index] = task.raw;
  setTasks(tasks);

  return NextResponse.json({
    data: task.raw,
  });
}

export async function DELETE(_, context) {
  const { id } = await context.params;

  const tasks = getTasks();
  const index = tasks.findIndex((it) => it.id === id);
  if (index == -1) {
    return notFound();
  }

  const res = tasks.splice(index, 1);
  setTasks(tasks);

  return NextResponse.json({
    data: res,
  });
}
