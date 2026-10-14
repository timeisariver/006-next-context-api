# 006-next-context-api

Next.js（App Router）で作るタスク管理アプリ。`app/api/` に配布された API を使い、React の Context API で状態を管理する。

## 技術スタック

- Next.js 16 / React 19（React Compiler 有効）
- TypeScript
- SCSS（CSS Modules）+ [clsx](https://github.com/lukeed/clsx)
- ESLint / Prettier

## はじめかた

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

| コマンド               | 内容                          |
| ---------------------- | ----------------------------- |
| `npm run dev`          | 開発サーバーを起動            |
| `npm run build`        | 本番ビルド                    |
| `npm run lint`         | ESLint でチェック             |
| `npm run typecheck`    | TypeScript の型チェック       |
| `npm run format`       | Prettier で整形               |
| `npm run format:check` | Prettier の整形漏れをチェック |
| `npm run screenshots`  | PR 用のスクリーンショット撮影 |

## Claude Code での開発の流れ

仕様書を書くところまでは人が行い、実装・レビュー・PR 作成を Claude Code に任せる。

```
仕様書を書く → /implement → 画面を確認 → /pr → PR をレビューしてマージ
  （人）         （AI）        （人）      （AI）        （人）
```

### 事前準備（初回のみ）

```bash
# GitHub CLI（/pr で PR を作成するのに使う）
winget install GitHub.cli
gh auth login

# スクリーンショット撮影用のブラウザ
npx playwright install chromium
```

### 1. 仕様書を書く

[docs/specs/\_template.md](docs/specs/_template.md) をコピーして `docs/specs/<機能名>.md` を作る。

- **要件**は、画面で確認できる粒度の箇条書きにする。AI はここに書いたことだけを実装し、レビューでも要件ごとに満たしているかを確認する。
- **対象外**を書いておくと、AI が仕様にないものを作り込むのを防げる。
- **対象ページ**は、PR に貼るスクリーンショットの撮影対象にもなる。

### 2. 実装させる（`/implement`）

```
/implement docs/specs/<機能名>.md
```

次の順に進む。

1. 仕様書が曖昧なら、実装の前に質問してくる。
2. main にいれば `feature/<機能名>` ブランチを作る。
3. FSD のスライス単位でタスクに分け、[implementer](.claude/agents/implementer.md) サブエージェントがそれぞれ別の worktree で並列に実装する。下のレイヤー（`shared`・`entities`）を先に作り、それを使う `_pages` を後から並列に作る。
4. 各 worktree の変更をブランチに統合し、型チェック・lint・整形を通す。
5. 2 種類のレビューを並列に行い、確実な指摘は直す。
   - [fsd-reviewer](.claude/agents/fsd-reviewer.md): 仕様の要件を満たしているか、FSD・CSS の規約を守っているか
   - 組み込みの `/code-review`: バグ
6. 実装内容と、直さずに残した指摘を報告する。

終わったら `npm run dev` で画面を確認する。AI のレビューは見た目の良し悪しまでは判断しないため、ここは人が見る。

### 3. PR を作らせる（`/pr`）

```
/pr              # 撮影するページは変更内容から自動で決める
/pr . about      # 撮影するページを指定する（先頭の / は省く。トップは .）
```

1. 型チェック・lint・整形が通ることを確認する。
2. 変更したページのスクリーンショットを PC 幅・スマホ幅で撮る（開発サーバーが動いていなければ起動する）。
3. ブランチを push し、[PR テンプレート](.github/pull_request_template.md)に沿って本文を書いて PR を作成する。

スクリーンショットはコードとは別の `screenshots` ブランチに置き、PR 本文からはその画像を参照する。公開リポジトリのため、個人情報などが映る画面は撮らないこと。

PR をレビューしてマージするのは人が行う。

### スクリーンショットだけ撮る

```bash
npm run dev                                       # 別のターミナルで起動しておく
npm run screenshots -- --no-publish . about       # .screenshots/<ブランチ名>/ に保存するだけ
npm run screenshots -- . about                    # screenshots ブランチに push して Markdown を出力
```

### 関連ファイル

| ファイル                                                                               | 内容                                         |
| -------------------------------------------------------------------------------------- | -------------------------------------------- |
| [.claude/skills/implement/](.claude/skills/implement/SKILL.md)                         | `/implement` スキル                          |
| [.claude/skills/pr/](.claude/skills/pr/SKILL.md)                                       | `/pr` スキル                                 |
| [.claude/skills/feature-sliced-design/](.claude/skills/feature-sliced-design/SKILL.md) | FSD 公式スキル（コードの置き場所の判断基準） |
| [.claude/agents/](.claude/agents/)                                                     | 実装・レビュー用のサブエージェント           |
| [.claude/settings.json](.claude/settings.json)                                         | 確認なしで実行してよいコマンドの許可設定     |
| [scripts/pr-screenshots.mjs](scripts/pr-screenshots.mjs)                               | スクリーンショットの撮影・push               |
| [docs/specs/](docs/specs/)                                                             | 仕様書                                       |

## ドキュメント

- [ディレクトリ構成（Feature-Sliced Design）](docs/architecture.md) — レイヤー・スライス・セグメントの分け方と依存ルール

### 要点

- ルートの `app/` は Next.js のルーティング専用。画面は `src/_pages/` に作り、`app/` からは再エクスポートするだけにする。
- `app/api/` は教材として配布された API のため改変しない。
- クラス名はルートを `.root`、子要素を `.title` のような camelCase にし、BEM は使わない（詳細は [AGENTS.md](AGENTS.md) の「CSS 命名規則」）。JSX では `clsx(s.root, { [s._active]: isActive })` のように指定する。
