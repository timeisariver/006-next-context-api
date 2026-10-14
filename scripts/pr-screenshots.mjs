// PR に貼るスクリーンショットを撮影し、`screenshots` ブランチに push して Markdown を出力する。
//
// 使い方:
//   node scripts/pr-screenshots.mjs [--base http://localhost:3000] [--key <名前>] [--no-publish] [パス ...]
//
// - 事前に `npm run dev`（または `npm run build && npm start`）でサーバーを起動しておく。
// - パスは先頭の / を省いて書く（例: `tasks`。トップページは `.`）。Git Bash が `/tasks` を
//   Windows のパスに変換してしまうため。省略するとトップページだけを撮影する。
// - `--key` は保存先フォルダ名（省略時は現在のブランチ名）。
// - 画像は `.screenshots/<key>/` に保存される。`--no-publish` なら push せずに終わる。
// - publish 時は `screenshots` ブランチ（コードとは無関係の orphan ブランチ）にコミットして push し、
//   PR 本文に貼れる Markdown を標準出力に出す。

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const BRANCH = "screenshots";
const OUT_ROOT = resolve(".screenshots");
const WORKTREE = join(OUT_ROOT, ".worktree");
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

function parseArgs(argv) {
  const opts = {
    base: "http://localhost:3000",
    key: null,
    publish: true,
    paths: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--base") opts.base = argv[++i];
    else if (a === "--key") opts.key = argv[++i];
    else if (a === "--no-publish") opts.publish = false;
    else if (/^[a-z]:[\\/]/i.test(a))
      throw new Error(
        `"${a}" は Windows のパスに変換されています（Git Bash の仕様）。先頭の / を省いて指定してください（例: tasks、トップは .）。`,
      );
    else opts.paths.push(a === "." ? "/" : `/${a.replace(/^\/+/, "")}`);
  }
  if (opts.paths.length === 0) opts.paths.push("/");
  opts.key ??= git("rev-parse", "--abbrev-ref", "HEAD");
  opts.key = opts.key.replace(/[^\w.-]+/g, "-");
  return opts;
}

const slug = (path) =>
  path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "_");

async function capture({ base, key, paths }) {
  try {
    await fetch(base);
  } catch {
    throw new Error(
      `${base} に接続できません。先に \`npm run dev\` を起動してください。`,
    );
  }

  const dir = join(OUT_ROOT, key);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const shots = [];
  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });
      for (const path of paths) {
        await page.goto(new URL(path, base).href, { waitUntil: "networkidle" });
        // next dev のインジケーター（左下の "N"）を隠す
        await page.addStyleTag({
          content: "nextjs-portal { display: none !important; }",
        });
        const file = `${slug(path)}-${vp.name}.png`;
        await page.screenshot({ path: join(dir, file), fullPage: true });
        shots.push({ path, viewport: vp.name, file });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return { dir, shots };
}

function publish({ key, dir }) {
  const origin = git("remote", "get-url", "origin");
  const repo = origin.match(/github\.com[:/](.+?)(?:\.git)?$/)?.[1];
  if (!repo) throw new Error(`origin が GitHub ではありません: ${origin}`);

  if (existsSync(WORKTREE)) git("worktree", "remove", "--force", WORKTREE);
  git("worktree", "prune");

  let remoteExists = true;
  try {
    git("fetch", "origin", BRANCH);
  } catch {
    remoteExists = false;
  }
  if (remoteExists)
    git("worktree", "add", "-B", BRANCH, WORKTREE, `origin/${BRANCH}`);
  else git("worktree", "add", "--orphan", "-b", BRANCH, WORKTREE);

  try {
    const dest = join(WORKTREE, key);
    rmSync(dest, { recursive: true, force: true });
    cpSync(dir, dest, { recursive: true });
    const wt = (...args) => git("-C", WORKTREE, ...args);
    wt("add", "--all", key);
    wt("commit", "-m", `screenshots: ${key}`);
    wt("push", "origin", BRANCH);
    return { repo, sha: wt("rev-parse", "HEAD") };
  } finally {
    git("worktree", "remove", "--force", WORKTREE);
  }
}

function toMarkdown(shots, urlOf) {
  const paths = [...new Set(shots.map((s) => s.path))];
  const lines = ["| ページ | Desktop | Mobile |", "| --- | --- | --- |"];
  for (const path of paths) {
    const cell = (vp) => {
      const shot = shots.find((s) => s.path === path && s.viewport === vp);
      return shot
        ? `<img src="${urlOf(shot.file)}" width="${vp === "mobile" ? 200 : 480}">`
        : "";
    };
    lines.push(`| \`${path}\` | ${cell("desktop")} | ${cell("mobile")} |`);
  }
  return lines.join("\n");
}

const opts = parseArgs(process.argv.slice(2));
const { dir, shots } = await capture(opts);
console.error(`撮影しました: ${dir}`);

if (opts.publish) {
  const { repo, sha } = publish({ key: opts.key, dir });
  const urlOf = (file) =>
    `https://raw.githubusercontent.com/${repo}/${sha}/${opts.key}/${file}`;
  console.log(toMarkdown(shots, urlOf));
}
