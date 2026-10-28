# 006-next-context-api

Next.js（App Router）で作るタスク管理アプリ。`app/api/` に配布された API を使い、React の Context API で状態を管理する。

## 技術スタック

- Next.js 16 / React 19（React Compiler 有効）
- TypeScript
- SCSS（CSS Modules）+ [clsx](https://github.com/lukeed/clsx)
- ESLint（jsx-a11y）/ Stylelint / Prettier

## はじめかた

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

| コマンド               | 内容                           |
| ---------------------- | ------------------------------ |
| `npm run dev`          | 開発サーバーを起動             |
| `npm run build`        | 本番ビルド                     |
| `npm run lint`         | ESLint と Stylelint でチェック |
| `npm run typecheck`    | TypeScript の型チェック        |
| `npm run format`       | Prettier で整形                |
| `npm run format:check` | Prettier の整形漏れをチェック  |
| `npm run screenshots`  | PR 用のスクリーンショット撮影  |

## プレビュー環境

main ブランチを Netlify で公開している。

https://silver-starburst-7b8837.netlify.app/

- main ブランチへ push されるたびに Netlify が自動でビルド・デプロイする（設定は [netlify.toml](netlify.toml)）。
- API のデータはサーバーのメモリ上にあるため、サーバーレス環境では再起動のたびに初期状態へ戻ることがある。

## Claude Code での開発の流れ

仕様書を書き、AI が作った実装プランを見直すところまでは人が行い、実装・レビュー・PR 作成を Claude Code に任せる。

```
仕様書を書く → /plan → プランを確認 → /implement → 画面とコードを確認 → /pr → PR をレビューしてマージ
 （人・AI）    （AI）     （人）        （AI）           （人）       （AI）        （人）
```

| 段階       | コマンド                        | 保存先               |
| ---------- | ------------------------------- | -------------------- |
| 仕様書     | `/spec <機能の説明>`（任意）    | `_specs/<機能名>.md` |
| 実装プラン | `/plan _specs/<機能名>.md`      | `_plans/<機能名>.md` |
| 実装       | `/implement _plans/<機能名>.md` | `feature/<機能名>`   |
| PR         | `/pr`                           | GitHub               |

### 事前準備（初回のみ）

```bash
# GitHub CLI（/pr で PR を作成するのに使う）
winget install GitHub.cli
gh auth login

# スクリーンショット撮影用のブラウザ
npx playwright install chromium
```

### 1. 仕様書を書く

[\_specs/\_template.md](_specs/_template.md) をコピーして `_specs/<機能名>.md` を作る。

`/spec` を使うと、短い説明から下書きと作業ブランチ（`feature/<slug>`）を作れる。既存のコードと API 仕様を調べて書き、引数から決められない点は `<!-- 要確認: 〜 -->` として残すので、見直して埋めてから `/plan` に進む。

```
/spec プロジェクト一覧ページを作る
/spec プロジェクトのカード, figma: https://www.figma.com/design/...
```

- **要件**は、画面で確認できる粒度の箇条書きにする。AI はここに書いたことだけを実装し、レビューでも要件ごとに満たしているかを確認する。
- **対象外**を書いておくと、AI が仕様にないものを作り込むのを防げる。
- **対象ページ**は、PR に貼るスクリーンショットの撮影対象にもなる。

### 2. 実装プランを作らせる（`/plan`）

```
/plan _specs/<機能名>.md
```

既存のコードと API を調べ、変更するファイルが重ならないようにタスクに分けたプランを、[\_plans/\_template.md](_plans/_template.md) の形式で `_plans/<機能名>.md` に保存する。仕様書が曖昧なら、プランを書く前に質問してくる。手順は [SKILL.md](.claude/skills/plan/SKILL.md) を参照。

プランはコミットされないので、見直して直してから `/implement` に進む。担当範囲が適切か、要件の割り当てに漏れがないかを確認する。

### 3. 実装させる（`/implement`）

```
/implement _plans/<機能名>.md
```

プランのタスクごとに [implementer](.claude/agents/implementer.md) サブエージェントが別の worktree で並列に実装し、統合したあと [fsd-reviewer](.claude/agents/fsd-reviewer.md)（要件と FSD・CSS の規約）と組み込みの `/code-review`（バグ）でレビューして、確実な指摘を直す。プランや仕様書が曖昧なら、実装の前に質問してくる。手順は [SKILL.md](.claude/skills/implement/SKILL.md) を参照。

最後に、実装内容と、直さずに残した指摘、プランから外れたことが報告される。終わったら、`npm run dev` で画面を、差分でコードを確認する。AI のレビューは見た目の良し悪しまでは判断せず、判断が分かれる指摘も直さずに残すため、ここは人が見る。

### 4. PR を作らせる（`/pr`）

```
/pr              # 撮影するページは変更内容から自動で決める
/pr . tasks      # 撮影するページを指定する（先頭の / は省く。トップは .）
```

型チェック・lint・整形が通ることを確かめ、変更したページのスクリーンショットを PC 幅（1440px）で撮り、[PR テンプレート](.github/pull_request_template.md)に沿って PR を作成する。手順は [SKILL.md](.claude/skills/pr/SKILL.md) を参照。

スクリーンショットはコードとは別の `screenshots` ブランチに置き、PR 本文からはその画像を参照する。公開リポジトリのため、個人情報などが映る画面は撮らないこと。

PR をレビューしてマージするのは人が行う。

### スクリーンショットだけ撮る

```bash
npm run dev                                       # 別のターミナルで起動しておく
npm run screenshots -- --no-publish . tasks       # .screenshots/<ブランチ名>/ に保存するだけ
npm run screenshots -- . tasks                    # screenshots ブランチに push して Markdown を出力
```

### 関連ファイル

| ファイル                                                                               | 内容                                           |
| -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [.claude/skills/spec/](.claude/skills/spec/SKILL.md)                                   | `/spec` スキル                                 |
| [.claude/skills/plan/](.claude/skills/plan/SKILL.md)                                   | `/plan` スキル                                 |
| [.claude/skills/implement/](.claude/skills/implement/SKILL.md)                         | `/implement` スキル                            |
| [.claude/skills/pr/](.claude/skills/pr/SKILL.md)                                       | `/pr` スキル                                   |
| [.claude/skills/feature-sliced-design/](.claude/skills/feature-sliced-design/SKILL.md) | FSD 公式スキル（コードの置き場所の判断基準）   |
| [.claude/agents/](.claude/agents/)                                                     | 実装・レビュー用のサブエージェント             |
| [.claude/rules/](.claude/rules/)                                                       | 対象のファイルを読んだときだけ読み込まれる規約 |
| [.claude/settings.json](.claude/settings.json)                                         | コマンドの許可と、`app/api/` の編集の拒否      |
| [.github/workflows/ci.yml](.github/workflows/ci.yml)                                   | CI（lint・型チェック・整形・ビルド）           |
| [.node-version](.node-version)                                                         | Node のバージョン（CI と Netlify が読む）      |
| [scripts/pr-screenshots.mjs](scripts/pr-screenshots.mjs)                               | スクリーンショットの撮影・push                 |
| [\_specs/](_specs/)                                                                    | 仕様書                                         |
| [\_plans/](_plans/)                                                                    | 実装プラン                                     |

## ドキュメント

- [CLAUDE.md](CLAUDE.md) — Claude Code が毎回読み込む指示（コマンド、コミットメッセージ、構成の要点）
- [ディレクトリ構成（Feature-Sliced Design）](docs/architecture.md) — レイヤー・スライス・セグメントの分け方と依存ルール
- [状態管理とデータの流れ](docs/state-management.md) — Context で共有するデータと、Context に載せないデータの取得
- [開発環境と CI](docs/development.md) — CI、Node のバージョン、仕組みで守らせているルール、ドキュメントの置き場所

UI コンポーネント・SCSS の規約は [.claude/rules/ui-component.md](.claude/rules/ui-component.md)、API の型と仕様の確かめ方は [.claude/rules/api-types.md](.claude/rules/api-types.md) にある。
