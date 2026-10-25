---
name: pr
description: 現在のブランチを push して GitHub に PR を作成する。変更内容の概要を本文にまとめ、画面のスクリーンショットを撮って添付する。
argument-hint: "[スクショを撮るページ（例: . tasks）]"
disable-model-invocation: true
---

現在のブランチから main への PR を作る。

## 1. 確認

- main にいる場合は止めて、ユーザーにブランチを切るよう伝える。
- `gh auth status` が通らない場合は止めて、`gh auth login` を実行するよう伝える。
- 未コミットの変更があれば、コミットするかどうかユーザーに確認する。
- `git fetch origin` する。
- `npm run typecheck`、`npm run lint`、`npm run format:check` が通ることを確認する。

## 2. 変更内容の把握

- `git log origin/main..HEAD`、`git diff origin/main...HEAD --stat`、`git diff origin/main...HEAD` を読む。
- 差分やコミットで `_specs/` の仕様書や `_plans/` のプランに触れていれば、それらも読む。

## 3. スクリーンショット

UI に関わる変更（`src/`、`app/` の `.tsx` / `.scss`）がなければこの手順は飛ばす。

1. 撮影するページを決める。引数 `$ARGUMENTS` があればそれを使う。なければ:
   - 変更された `src/_pages/<スライス>` を `@/_pages/<スライス>` で import している `app/**/page.tsx` を探し、そのルートを撮る。
   - `src/_app`・`src/entities`・`src/shared` が変わっていれば、トップページ（`.`）も撮る。
   - 仕様書の「対象ページ」に書かれたページも撮る。
   - パスは先頭の `/` を省いて書く（例: `tasks`。トップは `.`）。
2. `http://localhost:3000` に接続できなければ、`npm run dev` をバックグラウンドで起動し、応答するまで待つ。
3. `npm run screenshots -- --no-publish <ページ ...>` で撮影し、`.screenshots/` の画像を Read で確認する。エラー画面や空白になっていたら原因を調べる。
4. 問題なければ `npm run screenshots -- <ページ ...>` で `screenshots` ブランチに push し、出力された Markdown を本文に使う。
5. 自分で起動した開発サーバーは止める。

## 4. PR の作成

1. `git push -u origin HEAD` で push する。
2. `.github/pull_request_template.md` の見出しに沿って本文を書き、スクラッチパッドのファイルに保存する。
   - 「変更内容」はファイルの列挙ではなく、何ができるようになったか・何が変わったかを書く。
   - レビュー担当者が読む前提で、簡潔に書く。
3. タイトルは日本語で、変更内容を 1 行で表す（既存のコミットの書き方に合わせる）。
4. `gh pr create --base main --title "<タイトル>" --body-file <ファイル>` で作成し、PR の URL をユーザーに伝える。
