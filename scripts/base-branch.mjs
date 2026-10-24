// 現在のブランチの切り元（PR の比較先）を推定して、ブランチ名を出力する。
//
// 使い方:
//   node scripts/base-branch.mjs
//
// - main と、ほかのブランチ（ローカルと origin）のうち、HEAD の祖先で、HEAD までのコミット数が
//   最も少ないものを切り元とみなす。同数なら main を優先する。
// - 積み上げ式のブランチ（A のブランチから B を作る）で、B の比較先を A にするために使う。
// - 切り元の PR がマージ済みかどうかは見ない（呼び出し側で確認する）。

import { execFileSync } from "node:child_process";

const IGNORED = new Set(["HEAD", "origin", "screenshots"]);

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const isAncestor = (ref) => {
  try {
    git("merge-base", "--is-ancestor", ref, "HEAD");
    return true;
  } catch {
    return false;
  }
};

const current = git("rev-parse", "--abbrev-ref", "HEAD");
const refs = git(
  "for-each-ref",
  "--format=%(refname:short)",
  "refs/heads",
  "refs/remotes/origin",
)
  .split("\n")
  .filter(Boolean);

let best = null;
for (const ref of refs) {
  const name = ref.replace(/^origin\//, "");
  if (name === current || IGNORED.has(name) || !isAncestor(ref)) continue;
  const ahead = Number(git("rev-list", "--count", `${ref}..HEAD`));
  if (!best || ahead < best.ahead || (ahead === best.ahead && name === "main"))
    best = { name, ahead };
}

console.log(best?.name ?? "main");
