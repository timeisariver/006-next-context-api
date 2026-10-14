import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// FSD の import ルール（docs/architecture.md）。
// 同じルールを複数の設定で指定すると後のもので上書きされるため、レイヤーごとに全パターンを渡す。
const publicApiOnly = {
  group: ["@/*/*/*"],
  message:
    "スライス（またはセグメント）の内部を直接 import せず、index.ts（Public API）経由で import してください。",
};
const forbid = (layers, message) => ({
  group: layers.flatMap((layer) => [`@/${layer}`, `@/${layer}/*`]),
  message,
});
const fsdImports = (...patterns) => ({
  "no-restricted-imports": [
    "error",
    { patterns: [publicApiOnly, ...patterns] },
  ],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["app/**", "src/_app/**"],
    rules: fsdImports(),
  },
  {
    files: ["src/_pages/**"],
    rules: fsdImports(
      forbid(["_app"], "_pages から上のレイヤー（_app）は import できません。"),
      forbid(
        ["_pages"],
        "_pages のスライス同士は import できません。複数ページで使うものは entities か shared に移してください。",
      ),
    ),
  },
  {
    files: ["src/entities/**"],
    rules: fsdImports(
      forbid(
        ["_app", "_pages"],
        "entities から上のレイヤーは import できません。",
      ),
      forbid(["entities"], "entities のスライス同士は import できません。"),
    ),
  },
  {
    files: ["src/shared/**"],
    rules: fsdImports(
      forbid(
        ["_app", "_pages", "entities"],
        "shared からは他のレイヤーを import できません。",
      ),
    ),
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 教材として配布された API（改変しない）
    "app/api/**",
    // Claude Code のサブエージェント用 worktree
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
