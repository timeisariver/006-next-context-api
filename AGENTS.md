<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# コマンド

- `npm run dev` — 開発サーバーを起動する。
- `npm run lint` — ESLint を実行する。
- `npm run typecheck` — TypeScript の型チェックを実行する。
- `npm run format` / `npm run format:check` — Prettier で整形する / 整形済みか確認する。
- `npm run screenshots -- [ページ ...]` — PR 用のスクリーンショットを撮る（詳細は `scripts/pr-screenshots.mjs`）。

# 開発の流れ

1. 仕様書を `docs/specs/_template.md` をもとに `docs/specs/<機能名>.md` に書く（人が書く）。
2. `/implement docs/specs/<機能名>.md` — サブエージェントで並列に実装し、レビューまで行う。
3. `/pr` — スクリーンショットを撮り、PR を作成する。

# ディレクトリ構成（Feature-Sliced Design）

このプロジェクトは Feature-Sliced Design (FSD) v2.1 で構成する。詳細は `docs/architecture.md` を参照。

- ルートの `app/` は Next.js のルーティング専用。ルートファイルは `src/_pages/`（レイアウトは `src/_app/`）を再エクスポートするだけにする。
- FSD のレイヤーは `src/` に置く。Next.js と名前が衝突する `app` / `pages` レイヤーは `src/_app/` / `src/_pages/` とする。
- import は `@/*`（`src/*`）経由で行う（例: `@/_pages/home`, `@/shared/ui`）。
- `app/api/` は教材として配布された API のため改変しない（FSD の `api-routes` 構成の対象外）。

## スタイル（SCSS）

- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、コンポーネントの隣（各スライスの `ui/`）に置く。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`sassOptions.loadPaths` を設定済みのため、`src/shared/ui/_name.scss` は `@use "name";` のように相対パスなしで読み込める。

## CSS 命名規則

BEM は使わない。

- ルート要素のクラスは `.root`、子要素は役割を表す短い camelCase の名前（`.title`, `.statCount`）にする。ハイフンは使わない。
- `.ComponentName__element` のような BEM のプレフィックスは付けず、クラスはネストせずフラットに並べる。
- ネストしてよいのは擬似クラス・擬似要素（`&:hover`）、状態クラス（`&._active`）、メディアクエリのみ。
- クラス名は必ず `s.xxx` 経由で指定し、結合には `clsx` を使う（`{ [s._active]: isActive }`）。
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(s.root, className)` と結合する。
