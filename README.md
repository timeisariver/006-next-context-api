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

## プレビュー環境

main ブランチを Netlify で公開している。

https://silver-starburst-7b8837.netlify.app/

- main ブランチへ push されるたびに Netlify が自動でビルド・デプロイする（設定は [netlify.toml](netlify.toml)）。
- API のデータはサーバーのメモリ上にあるため、サーバーレス環境では再起動のたびに初期状態へ戻ることがある。

## Claude Code での開発の流れ

仕様書を書き、AI が作った実装プランを見直すところまでは人が行い、実装・レビュー・PR 作成を Claude Code に任せる。

```
仕様書を書く → /plan → プランを確認 → /implement → 画面を確認 → /pr → PR をレビューしてマージ
 （人・AI）     （AI）     （人）        （AI）        （人）      （AI）        （人）
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

次の順に進み、[\_plans/\_template.md](_plans/_template.md) の形式で `_plans/<機能名>.md` に保存する。

1. 仕様書が曖昧なら、プランを書く前に質問してくる。
2. main にいれば `feature/<機能名>` ブランチを作る。
3. 既存のコードと API を調べ、新しいコードをどのレイヤー・スライスに置くかを決める。
4. FSD のスライス単位で、変更するファイルが重ならないようにタスクに分ける。下のレイヤー（`shared`・`entities`）を第 1 段階、それを使う `_pages` を第 2 段階にする。
5. 各タスクの担当範囲、満たす要件、後の段階が使う公開 API と、仕様書から決めきれずに判断した点を書く。

プランはコミットされないので、見直して直してから `/implement` に進む。担当範囲が適切か、要件の割り当てに漏れがないかを確認する。

### 3. 実装させる（`/implement`）

```
/implement _plans/<機能名>.md
```

次の順に進む。

1. プランや仕様書が曖昧なら、実装の前に質問してくる。
2. 仕様書とプランをコミットする。
3. プランのタスクごとに、[implementer](.claude/agents/implementer.md) サブエージェントがそれぞれ別の worktree で並列に実装する。段階ごとに、前の段階の統合を待ってから次へ進む。
4. 各 worktree の変更をブランチに統合し、型チェック・lint・整形を通す。
5. 2 種類のレビューを並列に行い、確実な指摘は直す。
   - [fsd-reviewer](.claude/agents/fsd-reviewer.md): 仕様の要件を満たしているか、FSD・CSS の規約を守っているか
   - 組み込みの `/code-review`: バグ
6. 実装内容と、直さずに残した指摘、プランから外れたことを報告する。

終わったら `npm run dev` で画面を確認する。AI のレビューは見た目の良し悪しまでは判断しないため、ここは人が見る。

### 4. PR を作らせる（`/pr`）

```
/pr              # 撮影するページは変更内容から自動で決める
/pr . tasks      # 撮影するページを指定する（先頭の / は省く。トップは .）
```

1. 型チェック・lint・整形が通ることを確認する。
2. 変更したページのスクリーンショットを PC 幅（1440px）で撮る（開発サーバーが動いていなければ起動する）。
3. ブランチを push し、[PR テンプレート](.github/pull_request_template.md)に沿って本文を書いて PR を作成する。

スクリーンショットはコードとは別の `screenshots` ブランチに置き、PR 本文からはその画像を参照する。公開リポジトリのため、個人情報などが映る画面は撮らないこと。

PR をレビューしてマージするのは人が行う。

### レビュー待ちの機能の上に積む

PR はメンターのレビューが終わるまでマージしないため、レビュー待ちの機能のコードを使う機能は、その機能のブランチから作る。

```
main ── feature/dashboard (A) ── feature/tasks (B)   ← B は A のタスク取得を使う
     └─ feature/projects (C)                          ← A・B を使わないので main から
```

- どこから作るかは `/spec` が判断して伝える。B の PR は比較先が A のブランチになり、B の変更だけが表示される。
- A をマージするときは「Create a merge commit」を選ぶ。A のブランチが削除されると、GitHub が B の PR の比較先を main に切り替える。
- A にレビューの修正が入ったら、B で `/pr` をもう一度実行するか「B に A の修正を取り込んで」と頼む。

### スクリーンショットだけ撮る

```bash
npm run dev                                       # 別のターミナルで起動しておく
npm run screenshots -- --no-publish . tasks       # .screenshots/<ブランチ名>/ に保存するだけ
npm run screenshots -- . tasks                    # screenshots ブランチに push して Markdown を出力
```

### 関連ファイル

| ファイル                                                                               | 内容                                         |
| -------------------------------------------------------------------------------------- | -------------------------------------------- |
| [.claude/skills/spec/](.claude/skills/spec/SKILL.md)                                   | `/spec` スキル                               |
| [.claude/skills/plan/](.claude/skills/plan/SKILL.md)                                   | `/plan` スキル                               |
| [.claude/skills/implement/](.claude/skills/implement/SKILL.md)                         | `/implement` スキル                          |
| [.claude/skills/pr/](.claude/skills/pr/SKILL.md)                                       | `/pr` スキル                                 |
| [.claude/skills/feature-sliced-design/](.claude/skills/feature-sliced-design/SKILL.md) | FSD 公式スキル（コードの置き場所の判断基準） |
| [.claude/agents/](.claude/agents/)                                                     | 実装・レビュー用のサブエージェント           |
| [.claude/settings.json](.claude/settings.json)                                         | 確認なしで実行してよいコマンドの許可設定     |
| [scripts/pr-screenshots.mjs](scripts/pr-screenshots.mjs)                               | スクリーンショットの撮影・push               |
| [\_specs/](_specs/)                                                                    | 仕様書                                       |
| [\_plans/](_plans/)                                                                    | 実装プラン                                   |

## ドキュメント

- [ディレクトリ構成（Feature-Sliced Design）](docs/architecture.md) — レイヤー・スライス・セグメントの分け方と依存ルール

### 要点

- ルートの `app/` は Next.js のルーティング専用。画面は `src/_pages/` に作り、`app/` からは再エクスポートするだけにする。
- `app/api/` は教材として配布された API のため改変しない。
- クラス名はルートを `.root`、子要素を `.title` のような camelCase にし、BEM は使わない（詳細は [CLAUDE.md](CLAUDE.md) の「CSS 命名規則」）。JSX では `clsx(s.root, { [s._active]: isActive })` のように指定する。
