// CSS の規約（CLAUDE.md の「スタイル（SCSS）」「CSS 命名規則」）。
/** @type {import("stylelint").Config} */
const config = {
  extends: ["stylelint-config-standard-scss"],
  rules: {
    // 空行でのまとまりは書き手に任せる（整形は Prettier が担当する）。
    "custom-property-empty-line-before": null,
    "declaration-empty-line-before": null,

    // ルートは .root、子要素は camelCase、状態クラスは _active のように _ で始める。BEM・ハイフンは使わない。
    "selector-class-pattern": [
      "^_?[a-z][a-zA-Z0-9]*$",
      {
        message:
          "クラス名は camelCase（状態クラスは _active のように _ で始める）にしてください。BEM・ハイフンは使いません。",
      },
    ],
    // ネストしてよいのは擬似クラス・擬似要素、状態クラス、属性による状態（&[aria-invalid="true"]）だけ。
    // メディアクエリは at-rule のためこのルールの対象外。
    "selector-nested-pattern": [
      "^&(:|\\._|\\[)",
      {
        message:
          "ネストしてよいのは擬似クラス・擬似要素（&:hover）、状態クラス（&._active）、メディアクエリだけです。クラスはフラットに並べてください。",
      },
    ],
    // 色・影は globals.scss の CSS 変数を使う。
    "color-no-hex": [
      true,
      {
        message:
          "色は globals.scss の CSS 変数（var(--color-xxx)）を使ってください。",
      },
    ],
    "color-named": [
      "never",
      {
        message:
          "色は globals.scss の CSS 変数（var(--color-xxx)）を使ってください。",
      },
    ],
    "function-disallowed-list": [
      ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch"],
      {
        message:
          "色は globals.scss の CSS 変数（var(--color-xxx)）を使ってください。",
      },
    ],
  },
  overrides: [
    {
      // 色の変数を定義する場所なので、色の直接指定を許す。
      // リセットはブラウザ差を吸収するため、ベンダープレフィックスと #__next（Next.js が付ける id）を許す。
      files: ["src/_app/styles/**"],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "function-disallowed-list": null,
        "property-no-vendor-prefix": null,
        "selector-id-pattern": null,
      },
    },
  ],
  ignoreFiles: [".next/**", "out/**", "build/**", ".claude/worktrees/**"],
};

export default config;
