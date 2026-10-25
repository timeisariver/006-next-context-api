---
name: spec
description: 短いアイデアから _specs/ の仕様書の下書きと、作業ブランチを作る。
argument-hint: "<作りたい機能の説明>（Figma があれば「figma: <リンク>」を付ける）"
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Grep, Skill, Bash(git status:*), Bash(git switch:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git fetch:*), Bash(git diff:*)
---

`$ARGUMENTS` をもとに、仕様書の下書きと作業ブランチを作る。仕様書は人が見直して仕上げる前提で、ここでは下書きまでにする。

## 1. 確認

1. `git status --short` が空であることを確認する。空でなければ、コミットか stash をするようユーザーに伝えて**ここで止める**。
2. `$ARGUMENTS` が空、または何を作るのか読み取れない場合は、推測せずにユーザーに質問する。

## 2. 引数を読む

`$ARGUMENTS` から次を決める。

- **機能名**: 仕様書の見出しにする、短い日本語の名前（例: 「プロジェクト一覧ページ」）。
- **slug**: ファイル名とブランチ名に使う英語の kebab-case（例: `project-list`）。`a-z`・`0-9`・`-` だけを使い、40 文字以内にする。
- **ブランチ名**: `feature/<slug>`。`git branch --list` やリモートのブランチと重なる場合は `feature/<slug>-02` のように番号を付ける。`_specs/<slug>.md` が既にある場合も同じ番号を付ける。
- **Figma のリンク**: `figma:` の後ろにある URL（あれば）。

## 3. 調べる

仕様書に書く内容を、推測ではなくコードから確かめる。

- `CLAUDE.md`、`docs/architecture.md`、`_specs/_template.md` を読む。
- 既存のページ（`app/**/page.tsx`）と、関係しそうな `src/_pages`・`src/entities`・`src/shared` のコードを読み、「対象ページ」や流用できる既存コンポーネントを確かめる。
- データが要る機能なら、`app/api/v1/spec/swagger.yml/swagger.yml` から使うエンドポイントとレスポンスの項目を確かめる。

### Figma のリンクがある場合

1. `figma:figma-design-to-code` スキルを読み、その手順に従って Figma MCP でデザインを取得する（URL から fileKey と nodeId を取り出し、`create_session` してから `get_design_context` / `get_screenshot`）。
2. 実装に役立つ情報だけを 3〜8 個の箇条書きにまとめる: レイアウトと余白、文字の大きさ・太さ、色の使い分け、角丸・影、ボタンやアイコンなどの部品。色や影は、`src/_app/styles/globals.scss` のどの CSS 変数に当たるかも書く（当たるものがなければそう書く）。
3. 取得できなかった場合は「デザインを取得できませんでした。Figma を直接確認してください。」と書く。

いずれの場合も、Figma のリンクを「デザイン・補足」に残す。

## 4. ブランチを作る

`git fetch origin` し、`git switch --no-track -c <ブランチ名> origin/main` で作業ブランチを作って切り替える。

## 5. 仕様書を書く

`_specs/_template.md` の見出しと順序をそのまま使い、`_specs/<slug>.md` に保存する。テンプレートの HTML コメント（`<!-- -->`）は消す。

- **要件**は、画面で確認できる粒度のチェックボックス（`- [ ]`）で書く。`/implement` は要件に書いたことだけを実装するので、引数から読み取れることと、調べて確かめたことだけを書く。
- 引数からは決められない点（並び順、件数、空のときの表示など）は、要件に推測で書かず、その見出しの下に `<!-- 要確認: 〜 -->` で残す。
- **対象外**には、引数の範囲から外れるが作り込まれやすいこと（編集・削除、ページ送りなど）を書く。
- コード例や、ファイル構成などの実装方針は書かない（それは `/plan` が決める）。

## 6. 報告

仕様書の全文は貼らず、次の形式で伝える。

```
ブランチ: <ブランチ名>
仕様書: _specs/<slug>.md
機能名: <機能名>
```

続けて、`要確認` として残した点を箇条書きで伝える。最後に、仕様書を見直したら `/plan _specs/<slug>.md` で実装プランを作れることを伝える。
