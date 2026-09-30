import { NextResponse } from "next/server";
import dayjs from "dayjs";
import AppDate from "../../../lib/date";
import { getTasks, setTasks, getProjects, getUUID } from "../../../datastore";
import { factory } from "../../../datastore/models";
import { PageInfo } from "../../../datastore/models/pagination";

function parse(dateString) {
  if (!dateString) {
    return;
  }

  const [year, month, day] = dateString
    .split("-")
    .map((str) => parseInt(str, 10));
  return new AppDate(new Date(year, month - 1, day));
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 20;
  const status = searchParams.get("status") || ["scheduled"];

  const tasks = getTasks().filter((it) => {
    return status.includes(it.status);
  });

  tasks.sort((a, b) => {
    const aa = parse(a.deadline);
    const bb = parse(b.deadline);
    return aa.isAfter(bb) ? 1 : -1;
  });
  const pageInfo = new PageInfo({
    page,
    limit,
    totalCount: tasks.length,
  });

  const data = pageInfo.paginate(tasks);

  return NextResponse.json({
    data,
    pageInfo: pageInfo.serialize,
  });
}

export async function POST(request) {
  const { projectId, ...rest } = await request.json();

  const tasks = getTasks();
  const project = getProjects().find((it) => it.id === projectId);

  const task = factory.task({
    id: getUUID(),
    ...rest,
    project,
    createdAt: dayjs().format(),
    updatedAt: dayjs().format(),
  });
  const error = task.validate();
  if (error) {
    return NextResponse.json(
      {
        message: error,
      },
      {
        status: 400,
      },
    );
  }

  tasks.push(task.raw);
  setTasks(tasks);

  return NextResponse.json(
    {
      data: null,
    },
    {
      status: 201,
    },
  );
}
