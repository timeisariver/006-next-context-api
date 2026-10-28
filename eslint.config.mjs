import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";

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

// React Compiler が有効（next.config.ts）なため、useMemo / useCallback を手書きしない。
const noManualMemoMessage =
  "React Compiler が有効なため、手書きのメモ化（useMemo / useCallback）は不要です。";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // アクセシビリティ。eslint-config-next は一部のルールしか有効にしないため、推奨ルールをすべて有効にする。
  // プラグインは eslint-config-next が登録済みなので、ルールだけを足す。
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
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
  // 名前付き import は、FSD の no-restricted-imports を上書きしないよう no-restricted-syntax で検査する
  // （no-restricted-imports の importNames では `import * as React` まで禁止されるため）。
  // React.useMemo / React.useCallback の形で使うことも禁止する。
  {
    files: ["app/**", "src/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name=/^(useMemo|useCallback)$/]",
          message: noManualMemoMessage,
        },
      ],
      "no-restricted-properties": [
        "error",
        ...["useMemo", "useCallback"].map((property) => ({
          object: "React",
          property,
          message: noManualMemoMessage,
        })),
      ],
    },
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
