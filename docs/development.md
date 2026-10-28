# 開発環境と CI

よく使うコマンドと、変更後の確認は `CLAUDE.md` に書いている。ここには、その背景にある仕組みをまとめる。

## CI

PR と main への push では、GitHub Actions（[`.github/workflows/ci.yml`](../.github/workflows/ci.yml)）が `npm run lint`・`npm run typecheck`・`npm run format:check`・`npm run build` を実行する。main への push では、Netlify も同じビルドを実行する。

## Node のバージョン

Node のバージョンは [`.node-version`](../.node-version) だけに書く。CI（`actions/setup-node` の `node-version-file`）と Netlify の両方がこのファイルから読む。バージョンを変えるときは、このファイルだけを書き換える。

## 型チェック

`npm run typecheck` は、先に `next typegen` を実行する。`LayoutProps<"/">` などの型を生成するため。

## lint

- 1 ファイルだけ確認するときは `npx eslint <ファイル>` / `npx stylelint <ファイル>` を使う。
- `/implement` の worktree には node_modules がない。そこでは `npx` ではなく `npm run lint` を使う（`npm run` なら親ディレクトリの node_modules を使える）。
- `.claude/worktrees/` は `/implement` のサブエージェントが使う worktree で、ESLint・Stylelint・Prettier の対象外。

## Git の設定

[`.gitattributes`](../.gitattributes) で、改行を LF に固定している。

また `src/shared/api/index.ts` は `merge=union` にしている。そのため、並行するブランチがそれぞれ export を足しても競合せず、両方の行が残る。同じ行を書き換えた場合は両方残って重複するので、マージ後に確認する。

## 仕組みで守らせているルール

次のルールは、AI への指示ではなく lint・設定で守らせている。違反すると `npm run lint` がエラーになるか、編集が拒否される。

| ルール                                                                                    | 仕組み                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FSD の import ルール（レイヤーの依存方向、スライス間の import 禁止、Public API 経由のみ） | ESLint の `no-restricted-imports`（[`eslint.config.mjs`](../eslint.config.mjs)）。ルールを変えるときは [`docs/architecture.md`](architecture.md) と合わせて更新する         |
| CSS のクラス名・ネスト・色の直接指定                                                      | Stylelint（[`stylelint.config.mjs`](../stylelint.config.mjs)）。ルールを変えるときは [`.claude/rules/ui-component.md`](../.claude/rules/ui-component.md) と合わせて更新する |
| アクセシビリティ                                                                          | `eslint-plugin-jsx-a11y` の推奨ルール（[`eslint.config.mjs`](../eslint.config.mjs)）                                                                                        |
| `useMemo` / `useCallback` を手書きしない（React Compiler が有効なため。`next.config.ts`） | ESLint の `no-restricted-imports` の `paths` と `no-restricted-properties`（[`eslint.config.mjs`](../eslint.config.mjs)）                                                   |
| `app/api/` を編集しない                                                                   | [`.claude/settings.json`](../.claude/settings.json) の `permissions.deny`                                                                                                   |

`permissions.deny` は Claude Code の編集ツール（Edit・Write）にだけ効く。`sed -i` などのシェルからの書き換えは防げないため、`CLAUDE.md` にも「改変しない」と書いている。

## ドキュメントの置き場所

ドキュメントや規約を足す・移すときは、この節に従って置き場所を決める。`CLAUDE.md` に書き足し続けると、毎回読み込む量が増えるため。

### 読み込まれ方の違い

| 置き場所                              | Claude Code に読み込まれるタイミング                  |
| ------------------------------------- | ----------------------------------------------------- |
| `CLAUDE.md`                           | 毎回、起動時に全文                                    |
| `.claude/rules/*.md`（`paths:` なし） | 毎回、起動時に全文                                    |
| `.claude/rules/*.md`（`paths:` 付き） | `paths:` に合うファイルを読んだときに自動で           |
| スキル（`.claude/skills/`）           | 起動時は名前と `description` だけ。呼ばれたときに本文 |
| `docs/*.md`                           | AI が読むと判断したときだけ                           |

### 置き場所の判断基準

上から順に当てはまるものを選ぶ。

1. lint・設定で機械的に守らせられるルール → その仕組み（上の「仕組みで守らせているルール」に足す）。
2. ほぼすべての作業で要り、知らないと lint・型チェックなどで検出できない誤りや、取り返しにくい変更につながるもの → `CLAUDE.md`。
3. あるファイルを開いたときにだけ要る規約 → `.claude/rules/`（`paths:` に対象のファイルを書く）。
4. 特定のコマンド（`/pr` など）の手順 → そのスキル。
5. それ以外の仕組みや経緯の説明（人も読むもの） → `docs/`。

### `CLAUDE.md` からのリンク

`CLAUDE.md` から `docs/` へは、`@docs/xxx.md` のような `@` による読み込みではなく、普通の Markdown のリンクで書く。`@` で書いたファイルは起動時に展開され、毎回読み込まれるため。

`docs/` を読むかは AI の判断に任されるため、リンクは「〜するときは、先に〜を読む」という指示の形で書く。使ってみて読まれないことが多いドキュメントがあれば、`.claude/rules/` へ移すか `@` に切り替える。
