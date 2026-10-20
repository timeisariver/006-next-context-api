// レビュー待ち（オープン）の PR のブランチをすべて main に合わせてマージした `preview` ブランチを作り、
// origin に force push する。プレビュー用の使い捨てのブランチで、PR の比較元にはならない。
//
// 使い方:
//   node scripts/preview-branch.mjs [--no-push]
//
// - 作業ツリーは触らず、一時的な worktree の中でマージする。
// - 競合したブランチはマージを取り消し、スキップして最後に報告する。
// - 毎回 origin/main から作り直す（前回の preview には積まない）。

import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BRANCH = "preview";
const push = !process.argv.includes("--no-push");

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
const git = (...args) => run("git", args);

git("fetch", "origin", "--prune");

const heads = JSON.parse(
  run("gh", [
    "pr",
    "list",
    "--state",
    "open",
    "--json",
    "number,headRefName,isDraft",
  ]),
)
  .filter((pr) => pr.headRefName !== BRANCH)
  .sort((a, b) => a.number - b.number);

const dir = join(mkdtempSync(join(tmpdir(), "preview-")), "wt");
git("worktree", "add", "--detach", dir, "origin/main");
const wt = (...args) => git("-C", dir, ...args);

const merged = [];
const skipped = [];
try {
  for (const pr of heads) {
    try {
      wt(
        "merge",
        "--no-ff",
        "-m",
        `preview: #${pr.number} ${pr.headRefName}`,
        `origin/${pr.headRefName}`,
      );
      merged.push(pr);
    } catch {
      try {
        wt("merge", "--abort");
      } catch {}
      skipped.push(pr);
    }
  }

  wt("branch", "-f", BRANCH, "HEAD");
  if (push) wt("push", "--force", "origin", `${BRANCH}:${BRANCH}`);
} finally {
  git("worktree", "remove", "--force", dir);
}

for (const pr of merged) console.log(`マージ: #${pr.number} ${pr.headRefName}`);
for (const pr of skipped)
  console.log(`競合のためスキップ: #${pr.number} ${pr.headRefName}`);
console.log(
  push
    ? `origin/${BRANCH} を更新しました。`
    : `${BRANCH} をローカルに作りました（push していません）。`,
);
