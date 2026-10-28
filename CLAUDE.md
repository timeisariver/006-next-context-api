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
- `npm run lint` — ESLint と Stylelint を実行する。
- `npm run typecheck` — TypeScript の型チェックを実行する。
- `npm run format` / `npm run format:check` — Prettier で整形する / 整形済みか確認する。

テストフレームワークは導入していない。変更後は `npm run lint`、`npm run typecheck`、`npm run format:check` で確認する。

# 開発の流れ

仕様書（`_specs/`、`/spec` で下書きできる）→ `/plan` → `/implement` → `/pr` の順に進め、仕様書とプランは人が見直す。ブランチは機能ごとに main から作り、PR の比較先も main にする。各段階の詳細は [README.md](README.md) の「Claude Code での開発の流れ」にある。

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

このプロジェクトは Feature-Sliced Design (FSD) v2.1 で構成する。

- ルートの `app/` は Next.js のルーティング専用。ルートファイルは `src/_pages/`（レイアウトは `src/_app/`）を再エクスポートするだけにする。
- FSD のレイヤーは `src/` に置く。Next.js と名前が衝突する `app` / `pages` レイヤーは `src/_app/` / `src/_pages/` とする。
- import は `@/*`（`src/*`）経由で行う（例: `@/_pages/home`, `@/shared/ui`）。
- `app/api/` は教材として配布された API のため改変しない（例外は [docs/architecture.md](docs/architecture.md) の「その他のルール」）。

# 作業の前に読むもの

- 新しいファイルの置き場所を決めるときは、先に [docs/architecture.md](docs/architecture.md) を読む。
- 状態管理（Context）やデータ取得を変えるときは、先に [docs/state-management.md](docs/state-management.md) を読む。
- CI・lint・Git の設定を変えるとき、または lint などの仕組みで守らせているルールを確かめるときは、先に [docs/development.md](docs/development.md) を読む。
- ドキュメントや規約（`CLAUDE.md`・`docs/`・`.claude/rules/`・スキル）を足す・移すときは、先に [docs/development.md](docs/development.md) の「ドキュメントの置き場所」を読む。
- UI コンポーネント・SCSS の規約は [.claude/rules/ui-component.md](.claude/rules/ui-component.md)、API の型と仕様の確かめ方は [.claude/rules/api-types.md](.claude/rules/api-types.md) にある。対象のファイルを読むと自動で読み込まれるが、新しいファイルを作るだけのときは先に読む。
- スクリーンショットの撮り方は `/pr` スキル（[.claude/skills/pr/SKILL.md](.claude/skills/pr/SKILL.md)）にある。
