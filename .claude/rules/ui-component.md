---
paths:
  - "src/**/*.tsx"
  - "src/**/*.scss"
---

# UI コンポーネントと SCSS の規約

UI コンポーネント（`.tsx`）と SCSS の書き方の規約。スタイルの置き場所は `docs/architecture.md` の「その他のルール」にも書いている。

## lint で検査されるルール

違反すると `npm run lint` がエラーになる。

- BEM は使わない。ルート要素のクラスは `.root`、子要素は役割を表す短い camelCase の名前（`.title`, `.statCount`）にする。ハイフンは使わない。状態クラスは `._active` のように `_` で始める。（Stylelint）
- `.ComponentName__element` のような BEM のプレフィックスは付けず、クラスはネストせずフラットに並べる。（Stylelint）
- ネストしてよいのは擬似クラス・擬似要素（`&:hover`）、状態クラス（`&._active`）、属性による状態（`&[aria-invalid="true"]`）、メディアクエリのみ。（Stylelint）
- 色は `src/_app/styles/globals.scss` の CSS 変数（`var(--color-primary)` など）を使い、16 進数・色名・`rgb()` などを直接書かない。影の中の色も同じ。（Stylelint。`src/_app/styles/` は変数を定義する場所なので対象外）
- アクセシビリティは `eslint-plugin-jsx-a11y` の推奨ルールで検査される。正当な理由で外すときは、`eslint-disable-next-line` の上に理由をコメントで書く。（ESLint）

## lint では検査できないルール

- クラス名は必ず `s.xxx` 経由で指定し、結合には `clsx` を使う（`{ [s._active]: isActive }`）。
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(s.root, className)` と結合する。
- 影・フォントも `globals.scss` の CSS 変数を使い、直接書かない（lint が検査するのは色だけで、影のぼかしや位置、フォントの指定は検査されない）。
- ライトテーマのみ対応する（ダークモードには対応しない）。
- 足りない色は、既存の変数で代用できないか確認してから `globals.scss` に追加する。
- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、コンポーネントの隣（各スライスの `ui/`）に置く。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`sassOptions.loadPaths` を設定済みのため、`src/shared/ui/_name.scss` は `@use "name";` のように相対パスなしで読み込める。

## ルールを変えるとき

クラス名・ネスト・色の直接指定のルールを変えるときは、`stylelint.config.mjs` とこのファイルを合わせて更新する。
