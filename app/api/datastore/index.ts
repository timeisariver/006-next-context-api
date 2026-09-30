import dayjs from "dayjs";
import uuids from "./uuids";

const projects = [
  {
    id: "01aae611-e02f-46d7-997f-d88cd7842c01",
    name: "プログラミング",
    deadline: dayjs().add(7, "days").format(),
    slug: "programming",
    goal: "期限日までにフロントエンドエンジニアとして就職する。",
    shouldbe: "エンジニアとしての学習習慣を身につけて生活する。",
    color: "#00008c60",
    stats: {
      kinds: {
        milestone: 4,
        task: 30,
        total: 34,
      },
      states: {
        scheduled: 30,
        archived: 3,
        completed: 1,
      },
      total: 132,
    },
    milestones: [],
    status: "active",
    createdAt: dayjs().format(),
    updatedAt: dayjs().format(),
  },
  {
    id: "9a75b860-8587-4a78-98f8-39fae76b82df",
    name: "英語",
    deadline: dayjs().add(14, "days").format(),
    slug: "english",
    goal: "IELTS Overall 7.0 を取得する。",
    shouldbe: "英語に浸る。",
    color: "#0019ff99",
    stats: {
      kinds: {
        milestone: 4,
        task: 30,
        total: 34,
      },
      states: {
        scheduled: 30,
        archived: 3,
        completed: 1,
      },
      total: 132,
    },
    milestones: [],
    status: "active",
    createdAt: dayjs().format(),
    updatedAt: dayjs().format(),
  },
  {
    id: "f0647d45-78ec-4eb3-b432-712c3131a080",
    name: "プライベート",
    deadline: dayjs().add(21, "days").format(),
    slug: "private",
    goal: "長期休みに旅行をする",
    shouldbe: "",
    color: "#00a5ff99",
    stats: {
      kinds: {
        milestone: 4,
        task: 30,
        total: 34,
      },
      states: {
        scheduled: 30,
        archived: 3,
        completed: 1,
      },
      total: 132,
    },
    milestones: [],
    status: "active",
    createdAt: dayjs().format(),
    updatedAt: dayjs().format(),
  },
];

const initProjects = function () {
  // @ts-ignore
  globalThis.__datastore.projects = projects;
};

export const initTasks = function () {
  const __tasks = new Array(100).fill("").map((_, index) => ({
    id: uuids[index],
    description: "",
    kind: "task",
    title: `タスク ${index + 1}`,
    status: "scheduled",
    createdAt: dayjs().format(),
    updatedAt: dayjs().format(),
    deadline: dayjs().add(14, "days").format(),
    children: [],
    project: projects[0],
  }));

  // @ts-ignore
  globalThis.__datastore.tasks = __tasks;
};

const stats = [
  {
    label: "完了タスク",
    type: "completed",
    data: [
      {
        date: dayjs().add(-3, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
      {
        date: dayjs().add(-2, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
      {
        date: dayjs().add(-1, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
      {
        date: dayjs().add(0, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
      {
        date: dayjs().add(1, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
      {
        date: dayjs().add(2, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
      {
        date: dayjs().add(3, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 40),
      },
    ],
  },
  {
    label: "予定タスク",
    type: "todo",
    data: [
      {
        date: dayjs().add(-3, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
      {
        date: dayjs().add(-2, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
      {
        date: dayjs().add(-1, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
      {
        date: dayjs().add(0, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
      {
        date: dayjs().add(1, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
      {
        date: dayjs().add(2, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
      {
        date: dayjs().add(3, "day").toDate().getTime(),
        value: Math.floor(Math.random() * 100),
      },
    ],
  },
];

const initStats = () => {
  // @ts-ignore
  globalThis.__datastore.stats = stats;
};

export const getStats = () => {
  // @ts-ignore
  if (!globalThis.__datastore) {
    init();
  }

  // @ts-ignore
  return globalThis.__datastore.stats || [];
};

export const getTasks = () => {
  // @ts-ignore
  if (!globalThis.__datastore) {
    init();
  }

  // @ts-ignore
  return globalThis.__datastore.tasks || [];
};

export const setTasks = (tasks: any) => {
  // @ts-ignore
  if (!globalThis.__datastore) {
    init();
  }

  // @ts-ignore
  globalThis.__datastore.tasks = tasks;
};

export const getProjects = () => {
  // @ts-ignore
  if (!globalThis.__datastore) {
    init();
  }

  // @ts-ignore
  return globalThis.__datastore.projects || [];
};

export const getUUID = () => {
  const tasks = getTasks()
  const id = tasks[tasks.length-1].id
  const index = uuids.findIndex((uuid) => uuid === id);
  return uuids[index + 1];
}

export const init = () => {
  // @ts-ignore
  globalThis.__datastore = {};
  initStats();
  initProjects();
  initTasks();
};


