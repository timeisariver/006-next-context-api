# ドキュメントの整理

## 目的

`CLAUDE.md` は毎回の会話で必ず読み込まれるが、現在は特定の作業（PR 作成、API の型の更新、SCSS を書くときなど）でしか要らない説明や、`docs/architecture.md`・`README.md` と重複する説明も含んでいる（92 行）。`CLAUDE.md` には直接書いておくべきことだけを残し、それ以外は `docs/`、パス指定のルール（`.claude/rules/`）、スキル（`.claude/skills/`）に移して `CLAUDE.md` からリンクする。AI が必要になった時点で必要な情報だけを読む（段階的開示）ようにして、毎回読み込む量を減らし、同じ内容を複数の場所で更新する手間をなくす。

あわせて、AI への指示で守らせているルールのうち、設定・lint などの決定的な仕組みで守らせられるものはそちらに置き換え、指示そのものを減らす。人が読む `README.md` も、スキルやドキュメントと重複する説明を整理する。

## 対象ページ

なし（ドキュメントと設定ファイルだけの変更で、画面は変わらない）。

## 要件

**振り分けの基準**

- [ ] `CLAUDE.md` に直接残すのは、(1) ほぼすべての作業で必要になり、(2) 知らないと lint・型チェックなどで検出できない誤りや、取り返しにくい変更につながるものだけにする。それ以外はすべて別の Markdown に移し、`CLAUDE.md` からリンクする。
- [ ] 移す先は次のように使い分ける。
  - 設定・lint などで機械的に守らせられるルール → その仕組み（下の「決定的な仕組みに置き換えるもの」）。置き換えたルールは、AI への指示からは外すか 1 行に縮める。
  - いつでも参照しうる事実・仕組みの説明 → `docs/` のドキュメント
  - 特定の種類のファイルを扱うときだけ必要な規約 → パス指定のルール（`.claude/rules/*.md`）。frontmatter の `paths:` に対象のファイルを書き、そのファイルを読んだときに自動で読み込まれるようにする。
  - 特定のコマンド（`/pr` など）を実行するときだけ必要な手順 → そのスキル（`.claude/skills/`）。
- [ ] `CLAUDE.md` から移した先へのリンクは、普通の Markdown のリンクで書き、`@docs/xxx.md` のような `@` による読み込み（起動時に中身が展開され、毎回読み込まれる）は使わない。

**CLAUDE.md に残すもの**

- [ ] `next dev` が自動で書き足す「This is NOT the Next.js you know」の節（`<!-- BEGIN:nextjs-agent-rules -->`〜`<!-- END:nextjs-agent-rules -->`）は、そのまま残す（消しても再生成されるため）。
- [ ] よく使うコマンド（`dev`・`build`・`lint`・`typecheck`・`format` / `format:check`）と、変更後に `lint`・`typecheck`・`format:check` で確認すること（テストフレームワークはないこと）。
- [ ] コミットメッセージの形式と、種類・絵文字の表（`implementer` を含め、コミットのたびに使うため）。
- [ ] 構成の要点を数行で: FSD で構成していること、ルートの `app/` はルーティング専用で `src/_pages`・`src/_app` を再エクスポートするだけにすること、import は `@/*` 経由にすること、`app/api/` は改変しないこと（例外の詳細はリンク先に任せる）。
- [ ] 開発の流れ（`/spec` → `/plan` → `/implement` → `/pr`、ブランチは機能ごとに main から作る）は 1〜2 行にして、詳しい説明は `README.md` へリンクする。
- [ ] 移した先のドキュメント・ルール・スキルへのリンクを、「〜するときは、先に〜を読む」という指示の形で並べる（AI が読み飛ばしにくくするため）。

**決定的な仕組みに置き換えるもの**

- [ ] `app/api/` の改変禁止: `.claude/settings.json` の `permissions.deny` で、Claude Code が `app/api/` 以下のファイルを編集・作成できないようにする。`/implement` の worktree（`.claude/worktrees/` 以下）で動くサブエージェントにも効くことを確かめる。`CLAUDE.md` には「改変しない」の 1 行を残す（理由と例外の経緯は `docs/architecture.md`）。
- [ ] React Compiler が有効なため `useMemo` / `useCallback` を手書きしないこと: ESLint のルールで、`react` からの `useMemo`・`useCallback` の import と `React.useMemo`・`React.useCallback` の使用をエラーにする（エラーメッセージに理由を書く）。既存の `no-restricted-imports`（FSD の import ルール）の検査が引き続き効くようにする。`CLAUDE.md` からはこの指示を外す。
- [ ] Node のバージョンを CI と Netlify で合わせること: バージョンを書く場所を 1 つのファイル（例: `.node-version`）にまとめ、`.github/workflows/ci.yml`（`actions/setup-node` の `node-version-file`）と Netlify の両方がそこから読むようにする。「両方を更新する」という指示は不要にする。Netlify がそのファイルを読むことは、`/plan` の段階で Netlify のドキュメントで確かめる。

**docs/ に移すもの**

- [ ] 「ディレクトリ構成」のうち `docs/architecture.md` と重複する説明（`src/_app`・`src/_pages` の命名理由、`app/api/datastore` の `color` の例外の経緯、FSD の import ルールが `eslint.config.mjs` で検査されることなど）は、`docs/architecture.md` だけに残す。
- [ ] 状態管理とデータの流れ（`ProjectsProvider`・`useProjects()`・`TaskChangesProvider`・`revision`、`stats` が再計算されないため `refreshProjects()` を新しく呼ばなくてよいこと、Context に載せないデータは `_pages` が直接取得すること、データがサーバーのメモリにあり再起動で初期データに戻ること）を、新しいドキュメント `docs/state-management.md` に移す。
- [ ] `docs/development.md` に「ドキュメントの置き場所」の節を設け、`CLAUDE.md`・`docs/`・`.claude/rules/`・スキルの読み込まれ方の違いと、どれに置くかの判断基準（上の「振り分けの基準」と同じ）、`@` を使わない理由を書く。`CLAUDE.md` には「ドキュメントや規約を足す・移すときは、先にこの節を読む」という指示を 1 行残す。今後ドキュメントを足すときに、`CLAUDE.md` へ書き足されて元に戻るのを防ぐため。
- [ ] 開発環境・CI の仕組み（GitHub Actions が実行するチェック、Node のバージョンの置き場所、`npm run typecheck` が先に `next typegen` を実行する理由、`.claude/worktrees/` が lint・format の対象外であること、worktree では `npx` ではなく `npm run lint` を使うこと、`.gitattributes` の LF 固定と `src/shared/api/index.ts` の `merge=union`、上の決定的な仕組みで守らせているルールの一覧）を、新しいドキュメント `docs/development.md` に移す。

**パス指定のルールに移すもの**

- [ ] 「スタイル（SCSS）」「CSS 命名規則」と、アクセシビリティの lint を外すときに理由をコメントで書くこと、を新しいルール `.claude/rules/ui-component.md` に移す。`paths:` は `src/` の `.tsx` と `.scss` にし、UI コンポーネントや SCSS を読んだときに読み込まれるようにする。Stylelint で検査されるルールと、lint では検査できないルール（`clsx(s.root, className)` で結合する、既存の CSS 変数で代用できないか確かめるなど）を分けて書き、`stylelint.config.mjs` とこのルールを合わせて更新することも書く。
- [ ] API のレスポンス型を `src/shared/api/` に手書きしていること、swagger.yml の場所、`UpdateTask` が誤っているため `app/api/v1/users/tasks/[id]/route.js` と `app/api/datastore/models/task.ts` の `assign()` を参照すること、を新しいルール `.claude/rules/api-types.md` に移す。`paths:` は `src/shared/api/` と `app/api/` にし、API のコードや仕様を読んだときに読み込まれるようにする。

**スキルに移すもの**

- [ ] `npm run screenshots` の詳しい使い方（開発サーバーが前提、先頭の `/` を省く理由、`screenshots` ブランチはマージも削除もしないこと）を `/pr` スキルに移す。

**README.md の整理**

- [ ] `README.md` は人（開発者・レビュー担当者）向けとし、概要、技術スタック、はじめかた（コマンド表）、プレビュー環境、開発の流れ、ドキュメントの一覧で構成する。
- [ ] 「Claude Code での開発の流れ」は、各段階で人が何をするか（仕様書の書き方のコツ、プランで確認すること、実装後に見ること、PR をマージするのは人）を中心に残す。各スキルの内部の手順（`/plan`・`/implement`・`/pr` が順に何をするか）は `SKILL.md` と重複するため、要約とリンクにする。
- [ ] 「要点」の節（`app/` の扱い、`app/api/` の改変禁止、CSS のクラス名）は、`CLAUDE.md`・`docs/`・スキルと重複するため、リンクに置き換える。
- [ ] 「ドキュメント」「関連ファイル」の一覧に、新しく作ったドキュメント・ルール（`docs/state-management.md`・`docs/development.md`・`.claude/rules/ui-component.md`・`.claude/rules/api-types.md`）と、Node のバージョンを書いたファイルを加える。
- [ ] 「プレビュー環境」の、データが再起動で初期状態に戻る説明は残す（人が Netlify で触るときに必要なため）。

**参照の更新**

- [ ] `.claude/skills/`（`spec`・`plan`・`implement`・`pr`）と `.claude/agents/`（`implementer`・`fsd-reviewer`）で、`CLAUDE.md` の特定の節を参照している箇所（「`UpdateTask` の扱いは `CLAUDE.md` を参照」「`CLAUDE.md` の「CSS 命名規則」」など）を、移した先に合わせて直す。
- [ ] `implementer` は、担当範囲に UI コンポーネント・SCSS が含まれるときは `.claude/rules/ui-component.md` を、`src/shared/api/` が含まれるときは `.claude/rules/api-types.md` を読んでから実装する（新しいファイルを作るだけで対象のファイルを読まない場合、ルールが自動で読み込まれないことがあるため）。
- [ ] `fsd-reviewer` は、CSS・コンポーネントの確認の前に `.claude/rules/ui-component.md` を読む。lint で検査されるようになったルールは、確認項目から外すか「lint で検査済み」と書く。
- [ ] `/plan`・`/spec` で状態管理やデータ取得に関わる機能を扱うときは、`docs/state-management.md` を読む。
- [ ] `docs/architecture.md`・`stylelint.config.mjs` のコメント・`.github/workflows/ci.yml` のコメント・`.claude/skills/feature-sliced-design/SOURCE.md` で `CLAUDE.md` の節や `netlify.toml` の `NODE_VERSION` を参照している箇所を、移した先に合わせて直す。
- [ ] 移す前後で、書かれている規約・事実の内容が失われていない（言い回しの整理や、決定的な仕組みへの置き換えはよいが、ルールの中身を削ったり変えたりしない）。
- [ ] `npm run lint`・`npm run typecheck`・`npm run format:check` が通る（ESLint に足したルールに既存のコードが違反しないこと）。

## 対象外

- 規約そのものの変更（CSS 命名規則、FSD の依存ルール、コミットメッセージの形式などの中身を変えること）。
- ESLint・Stylelint・Prettier の既存のルールの変更・削除（`useMemo` / `useCallback` の禁止を足すことを除く）。
- コミットメッセージの形式を Git のフック（husky・commitlint など）で検査すること（依存パッケージやクローンごとの設定が増えるため。今回は `CLAUDE.md` の表で守らせる）。
- `clsx(s.root, className)` で結合しているかなど、lint で検査するには独自ルールが要るものの自動化。
- Claude Code のフック（編集後に Prettier を自動で実行するなど）の追加。
- `.claude/skills/feature-sliced-design/` の `SKILL.md`・`references/` の編集（FSD 公式スキルのコピーで、手で編集しないため。出典を書いた `SOURCE.md` は参照の更新のみ行う）。
- 過去の `_specs/`・`_plans/` に書かれた `CLAUDE.md` への参照の書き換え（その時点の記録のため）。
- ユーザー個人の設定（`~/.claude/CLAUDE.md`、メモリ）の変更。
- `src/`・`app/` のコードの変更。

## 使う API・データ

なし。

## デザイン・補足

- 現在の `CLAUDE.md` は 92 行。節は「This is NOT the Next.js you know」「コマンド」「開発の流れ」（コミットメッセージを含む）「ディレクトリ構成」（スタイル・CSS 命名規則を含む）「テストと確認」「アーキテクチャ」。
- `docs/` には現在 `docs/architecture.md`（FSD の構成と依存ルール）だけがある。`app/api/` の `color` の例外、`src/_app/styles/`・CSS Modules・SCSS パーシャルの置き場所は、`CLAUDE.md` と `docs/architecture.md` の両方に書かれている。
- `README.md`（164 行）の「Claude Code での開発の流れ」は、`/plan`・`/implement`・`/pr` が内部で行う手順を番号付きで書いており、各 `SKILL.md` と重複している。「要点」の節は `CLAUDE.md` と重複し、CSS 命名規則は `CLAUDE.md` の節にリンクしている。
- 現在 `src/` には `useMemo`・`useCallback` の使用はない。`eslint.config.mjs` はファイルの場所ごとに `no-restricted-imports` を設定しているため、同じルールで `react` の import を制限すると設定が上書きされうる（どう足すかは `/plan` で決める）。
- Node のバージョンは現在、`netlify.toml` の `NODE_VERSION = "22"` と `.github/workflows/ci.yml` の `node-version: 22` の 2 か所に書かれている。
- `.claude/settings.json` には現在 `permissions.allow` だけがあり、`deny` はない。
- `CLAUDE.md` の特定の節を参照しているファイル: `.claude/agents/implementer.md`・`.claude/agents/fsd-reviewer.md`、`.claude/skills/{spec,plan,implement,pr}/SKILL.md`、`.claude/skills/feature-sliced-design/SOURCE.md`、`docs/architecture.md`、`README.md`、`stylelint.config.mjs`。
- 読み込まれ方の違い（Claude Code のドキュメントで確認）:
  - `CLAUDE.md` と、`paths:` のない `.claude/rules/*.md` は、毎回起動時に全文が読み込まれる。`CLAUDE.md` に `@path` で書いたファイルも起動時に展開される。
  - `paths:` 付きの `.claude/rules/*.md` は、合うファイルを Claude が読んだときに読み込まれる。ツールを使うたびではなく、読んだときだけ。
  - スキルは起動時には名前と `description` だけが読み込まれ、呼ばれたときに本文が読み込まれる。
  - `docs/*.md` は、Claude が読むと判断したときだけ読まれる。
- サブエージェント（`implementer`・`fsd-reviewer`）は `CLAUDE.md` を自動で読み込むが、`docs/` は依頼文やエージェント定義で指示しないと読まない。そのため、規約に関わるものはエージェント定義でも読むよう指示する。
