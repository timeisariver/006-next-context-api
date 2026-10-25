# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# コマンド

- `npm run dev` — 開発サーバーを起動する。
- `npm run build` — 本番ビルドを行う（main への push で Netlify も同じビルドを実行する）。
- `npm run lint` — ESLint と Stylelint を実行する。1 ファイルだけ確認するときは `npx eslint <ファイル>` / `npx stylelint <ファイル>`（`/implement` の worktree には node_modules がないため、そこでは `npm run lint` を使う）。
- `npm run typecheck` — TypeScript の型チェックを実行する。
- `npm run format` / `npm run format:check` — Prettier で整形する / 整形済みか確認する。
- `npm run screenshots -- [ページ ...]` — PR 用のスクリーンショットを撮る（詳細は `scripts/pr-screenshots.mjs`）。開発サーバーの起動が前提。ページは先頭の `/` を省いて書く（例: `tasks`、トップは `.`。Git Bash が `/tasks` を Windows のパスに変換するため）。画像は orphan ブランチ `screenshots` に push され、PR 本文から参照される。このブランチはマージも削除もしない。

# 開発の流れ

1. 仕様書を `_specs/_template.md` をもとに `_specs/<機能名>.md` に書く（人が書く）。`/spec <機能の説明>` で下書きと作業ブランチを作ってから、人が見直してもよい。
2. `/plan _specs/<機能名>.md` — タスク分割と担当範囲を決めた実装プランを `_plans/<機能名>.md` に書く。人が見直す。
3. `/implement _plans/<機能名>.md` — プランに沿ってサブエージェントで並列に実装し、レビューまで行う。
4. `/pr` — スクリーンショットを撮り、PR を作成する。

ブランチは機能ごとに main から作り、PR の比較先も main にする。

## コミットメッセージ

`<絵文字> <種類>: <変更内容>` の形で、変更内容は日本語で書く（例: `✨ feat: タスク一覧にページ送りを追加`）。

| 種類       | 絵文字 | 使う場面                                       |
| ---------- | ------ | ---------------------------------------------- |
| `feat`     | ✨     | 機能の追加                                     |
| `fix`      | 🩹     | バグの修正                                     |
| `docs`     | 📝     | ドキュメント・仕様書・プランだけの変更         |
| `style`    | 💄     | 見た目（CSS）だけの変更                        |
| `refactor` | ♻️     | 動作を変えないコードの整理                     |
| `chore`    | 🔧     | 設定・ツール・依存パッケージ・スクリプトの変更 |

# ディレクトリ構成（Feature-Sliced Design）

このプロジェクトは Feature-Sliced Design (FSD) v2.1 で構成する。詳細は `docs/architecture.md` を参照。

- ルートの `app/` は Next.js のルーティング専用。ルートファイルは `src/_pages/`（レイアウトは `src/_app/`）を再エクスポートするだけにする。
- FSD のレイヤーは `src/` に置く。Next.js と名前が衝突する `app` / `pages` レイヤーは `src/_app/` / `src/_pages/` とする。
- import は `@/*`（`src/*`）経由で行う（例: `@/_pages/home`, `@/shared/ui`）。
- `app/api/` は教材として配布された API のため改変しない（FSD の `api-routes` 構成の対象外）。

## スタイル（SCSS）

- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- ライトテーマのみ対応する（ダークモードには対応しない）。
- 色・影・フォントは `src/_app/styles/globals.scss` の CSS 変数（`var(--color-primary)` など）を使い、16 進数などを直接書かない。足りない色は、既存の変数で代用できないか確認してから globals.scss に追加する。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、コンポーネントの隣（各スライスの `ui/`）に置く。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`sassOptions.loadPaths` を設定済みのため、`src/shared/ui/_name.scss` は `@use "name";` のように相対パスなしで読み込める。

## CSS 命名規則

BEM は使わない。

- ルート要素のクラスは `.root`、子要素は役割を表す短い camelCase の名前（`.title`, `.statCount`）にする。ハイフンは使わない。
- `.ComponentName__element` のような BEM のプレフィックスは付けず、クラスはネストせずフラットに並べる。
- ネストしてよいのは擬似クラス・擬似要素（`&:hover`）、状態クラス（`&._active`）、属性による状態（`&[aria-invalid="true"]`）、メディアクエリのみ。
- クラス名は必ず `s.xxx` 経由で指定し、結合には `clsx` を使う（`{ [s._active]: isActive }`）。
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(s.root, className)` と結合する。

クラス名・ネスト・色の直接指定は `stylelint.config.mjs` で検査され、違反すると `npm run lint` がエラーになる。ルールを変えるときはこの節と合わせて更新する。

# テストと確認

テストフレームワークは導入していない。変更後は `npm run lint`、`npm run typecheck`、`npm run format:check` で確認する。`npm run typecheck` は `next typegen` を先に実行する（`LayoutProps<"/">` などの型を生成するため）。

# アーキテクチャ

- 状態管理は React Context で、共有するのはプロジェクト一覧だけ。`src/_app/layouts/RootLayout.tsx` が `entities/project` の `ProjectsProvider` でアプリ全体を包み、各所は `useProjects()` で `projects`・`isLoading`・`error`・`refreshProjects` を読む。`ProjectsProvider` はマウント時に `shared/api` の `getProjects()`（axios で `/api/v1/users/projects`）を 1 回呼ぶ。プロジェクトはタスクの件数などの集計を持つため、タスクを作成・更新・削除したら `refreshProjects()` で取り直す。
- タスク・統計・プロジェクト詳細・タスク詳細は Context に載せず、`_pages` のクライアントコンポーネントが `shared/api` の関数で直接取得する。
- API のデータはサーバーのメモリ（`globalThis.__datastore`）にあり、開発サーバーを再起動すると初期データに戻る。Netlify 上でも再起動のたびに戻ることがある。
- API のレスポンス型（`Project` など）は `src/shared/api/` に手書きしている。`app/api/` は改変禁止のため、API 側の変更を型に反映するときは `app/api/v1/spec/swagger.yml/swagger.yml` を参照する（開発サーバー起動中は `http://localhost:3000/api/v1/spec` でも読める）。ただし swagger.yml の `UpdateTask`（`PATCH /users/tasks/{id}` のリクエスト）は誤っているため、`app/api/v1/users/tasks/[id]/route.js` と `app/api/datastore/models/task.ts` の `assign()` を参照する（`projectId`・`title`・`description`・`status`・`deadline` を受け付ける）。
- FSD の import ルール（レイヤーの依存方向、スライス間の import 禁止、Public API 経由のみ）は `eslint.config.mjs` の `no-restricted-imports` で検査される。ルールを変えるときは `docs/architecture.md` と合わせて更新する。
- アクセシビリティは `eslint-plugin-jsx-a11y` の推奨ルールで検査される。正当な理由で外すときは、`eslint-disable-next-line` の上に理由をコメントで書く。
- React Compiler が有効（`next.config.ts`）。`useMemo` / `useCallback` を手書きで足さない。
- `.claude/worktrees/` は `/implement` のサブエージェントが使う worktree で、ESLint・Stylelint・Prettier の対象外。
- `.gitattributes` で改行を LF に固定している。また `src/shared/api/index.ts` は `merge=union` のため、並行するブランチがそれぞれ export を足しても競合せず、両方の行が残る（同じ行を書き換えた場合は両方残って重複するので、マージ後に確認する）。
