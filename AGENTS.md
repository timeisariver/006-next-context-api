<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ディレクトリ構成（Feature-Sliced Design）

このプロジェクトは Feature-Sliced Design (FSD) v2.1 で構成する。詳細は `docs/architecture.md` を参照。

- ルートの `app/` は Next.js のルーティング専用。ルートファイルは `src/_pages/` を再エクスポートするだけにする。
- FSD のレイヤーは `src/` に置く。Next.js と名前が衝突する `app` / `pages` レイヤーは `src/_app/` / `src/_pages/` とする。
- import は `@/*`（`src/*`）経由で行う（例: `@/_pages/home`, `@/shared/ui`）。
- `app/api/` は教材として配布された API のため改変しない（FSD の `api-routes` 構成の対象外）。

## スタイル（SCSS）

- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、コンポーネントの隣（各スライスの `ui/`）に置く。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`sassOptions.loadPaths` を設定済みのため `@use "breakpoints" as bp;` のように相対パスなしで読み込める。

## CSS 命名規則（変形 BEM）

詳細は `docs/css-naming.md` を参照。要点:

- Block はコンポーネント名と同じ PascalCase（`.TabPanel`）。1 つの `.module.scss` に Block は 1 つ。
- Element は `.TabPanel__tab`、Modifier は `._active` のように独立したクラスにし、SCSS では必ず `&._active` とネストして Block / Element と組み合わせる。
- Element 名・Modifier 名は camelCase にし、ハイフンを使わない。Element のネストは 1 階層まで。
- クラス名は必ず `styles.xxx` 経由で指定し、結合には `clsx` を使う（`{ [styles._active]: isActive }`）。
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(styles.Block, className)` と結合する。
