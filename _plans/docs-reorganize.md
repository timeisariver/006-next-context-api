# ドキュメントの整理 実装プラン

- 仕様書: [\_specs/docs-reorganize.md](../_specs/docs-reorganize.md)
- ブランチ: `feature/docs-reorganize`

## 方針

コードではなくドキュメントと設定の変更なので、FSD のレイヤーではなく「移す先を作る」→「移す元と参照を直す」の順に分ける。

- **第 1 段階**で、移す先（決定的な仕組み、`docs/` の新しいドキュメント、`.claude/rules/` のパス指定のルール）を作る。
- **第 2 段階**で、移す元の `CLAUDE.md`・`README.md` を書き直し、既存のスキル・エージェントの参照を直す。第 1 段階でできたファイルを実際に読んでからリンクできるようにするため、段階を分ける。

`CLAUDE.md` の各行をどこへ移すかは、次の表で決める。どのタスクもこの表に従い、内容を落とさない（言い回しの整理はよい）。

| `CLAUDE.md` の現在の内容（行）                                                         | 移す先                                                                       |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 「This is NOT the Next.js you know」の節（5〜13）                                     | `CLAUDE.md` にそのまま残す                                                   |
| コマンド `dev`・`build`・`lint`・`typecheck`・`format`（17〜21）                       | `CLAUDE.md` に残す。1 ファイルだけ lint する方法と worktree の注意は `docs/development.md` |
| `npm run screenshots` の詳細（22）                                                     | `/pr` スキル                                                                 |
| 開発の流れ（24〜31）                                                                   | `CLAUDE.md` に 1〜2 行。詳細は `README.md`                                   |
| コミットメッセージ（33〜44）                                                           | `CLAUDE.md` にそのまま残す                                                   |
| ディレクトリ構成の要点（46〜52）                                                       | `CLAUDE.md` に数行。命名の理由などは `docs/architecture.md`（既にある）       |
| `app/api/` の改変禁止と `color` の例外（53）                                           | `CLAUDE.md` に「改変しない」の 1 行。例外は `docs/architecture.md`（既にある）と `permissions.deny` |
| スタイル（SCSS）・CSS 命名規則（55〜73）                                               | ルール `.claude/rules/ui-component.md`                                       |
| テストと確認（77）                                                                     | 確認コマンドは `CLAUDE.md`。`next typegen` の理由は `docs/development.md`     |
| CI と Node のバージョン（79）                                                          | `docs/development.md`（バージョンは `.node-version` に一本化）                |
| 状態管理とデータの流れ（83〜86）                                                       | `docs/state-management.md`                                                   |
| API のレスポンス型と `UpdateTask`（87）                                                | ルール `.claude/rules/api-types.md`                                          |
| FSD の import ルールが ESLint で検査されること（88）                                   | `docs/architecture.md`（既にある）                                           |
| アクセシビリティの lint と、外すときのコメント（89）                                   | ルール `.claude/rules/ui-component.md`                                       |
| React Compiler と `useMemo` / `useCallback`（90）                                      | ESLint のルール。`docs/development.md` の「仕組みで守らせているルール」に記載 |
| `.claude/worktrees/` が lint の対象外（91）、`.gitattributes`（92）                    | `docs/development.md`                                                        |

## タスク

### 第 1 段階

#### タスク 1: 決定的な仕組みに置き換える

- 目的: AI への指示で守らせている 3 つのルールを、設定・lint で守らせる。
- 担当範囲:
  - `.claude/settings.json`
  - `eslint.config.mjs`
  - `.node-version`（新規）
  - `netlify.toml`
  - `.github/workflows/ci.yml`
- 要件:
  - `app/api/` の改変禁止: `.claude/settings.json` に `permissions.deny` を足し、`Edit(/app/api/**)`・`Write(/app/api/**)` を拒否する。パスはプロジェクトのルートからの相対パス（先頭の `/`）で書く。`/implement` の worktree でも効くように、`Edit(/.claude/worktrees/*/app/api/**)`・`Write(/.claude/worktrees/*/app/api/**)` も足す。既存の `allow` は変えない。
  - `useMemo` / `useCallback` の禁止: `eslint.config.mjs` で次の 2 つを足す。エラーメッセージには「React Compiler が有効なため、手書きのメモ化は不要」という理由を書く。
    - `react` からの `useMemo`・`useCallback` の import をエラーにする。`no-restricted-imports` は FSD の import ルールで使っていて、同じルールを別の設定で指定すると後のもので上書きされる。そのため、`fsdImports()` が返すオプションに `paths`（`name: "react"`, `importNames: ["useMemo", "useCallback"]`）を加えて、FSD のパターンと一緒に渡す。`app/**` と `src/**` のすべてのファイルが `fsdImports()` のどれかの対象になっていることを確かめる。
    - `React.useMemo`・`React.useCallback` の使用を `no-restricted-properties` でエラーにする（`app/**`・`src/**` が対象）。
    - 既存の FSD の import 違反が引き続き検出されることを、一時的に違反する import を書いて `npm run lint` で確かめ、元に戻す。`useMemo` の import でエラーになることも同じように確かめる。
  - Node のバージョン: `.node-version`（中身は `22`）を作る。`.github/workflows/ci.yml` の `actions/setup-node` を `node-version-file: .node-version` に変え、`netlify.toml` から `NODE_VERSION` を消す（Netlify は `.node-version` を読み、`NODE_VERSION` 環境変数より優先する）。`[build.environment]` が空になる場合は節ごと消す。`ci.yml` の「Netlify（netlify.toml の NODE_VERSION）に合わせる」というコメントも直す。
- 公開 API:
  - `.node-version` — Node のバージョンを書く唯一のファイル
  - `.claude/settings.json` の `permissions.deny` — `app/api/` の編集・作成の拒否

#### タスク 2: 移す先のドキュメントとルールを作る

- 目的: `CLAUDE.md` から移す内容の受け皿を作る。
- 担当範囲:
  - `docs/state-management.md`（新規）
  - `docs/development.md`（新規）
  - `docs/architecture.md`
  - `.claude/rules/ui-component.md`（新規）
  - `.claude/rules/api-types.md`（新規）
  - `stylelint.config.mjs`（先頭のコメントだけ）
- 要件:
  - `docs/state-management.md`: `CLAUDE.md` の 83〜86 行（`ProjectsProvider`・`useProjects()`・`TaskChangesProvider`・`revision`、`stats` が再計算されないため `refreshProjects()` を新しく呼ばなくてよいこと、Context に載せないデータは `_pages` が直接取得すること、データがサーバーのメモリにあり再起動で初期データに戻ること）を、見出しを付けて書く。`docs/architecture.md` と文体をそろえる。
  - `docs/development.md`: 次を書く。
    - GitHub Actions（`.github/workflows/ci.yml`）が PR と main への push で `lint`・`typecheck`・`format:check`・`build` を実行すること。
    - Node のバージョンは `.node-version` だけに書き、CI と Netlify の両方がそこから読むこと。
    - `npm run typecheck` が先に `next typegen` を実行する理由（`LayoutProps<"/">` などの型を生成するため）。
    - 1 ファイルだけ確認するときは `npx eslint <ファイル>` / `npx stylelint <ファイル>`。`/implement` の worktree には node_modules がないため、そこでは `npm run lint` を使うこと。
    - `.claude/worktrees/` は `/implement` のサブエージェントが使う worktree で、ESLint・Stylelint・Prettier の対象外であること。
    - `.gitattributes` で改行を LF に固定していること、`src/shared/api/index.ts` は `merge=union` で、並行するブランチが export を足しても競合しないこと（同じ行を書き換えると重複するので、マージ後に確認すること）。
    - 「ドキュメントの置き場所」の節: 今後ドキュメントや規約を足すときに、どこに置くかを判断できるようにする。
      - 読み込まれ方の違い: `CLAUDE.md` と `paths:` のない `.claude/rules/*.md` は毎回全文、`paths:` 付きの `.claude/rules/*.md` は対象のファイルを読んだときに自動で、スキルは呼ばれたときに本文、`docs/*.md` は AI が読むと判断したときだけ。
      - 置き場所の判断基準: lint・設定で機械的に守らせられるならその仕組み、ほぼすべての作業で要り知らないと検出できない誤りにつながるなら `CLAUDE.md`、あるファイルを開いたときにだけ要るなら `.claude/rules/`（`paths:` 付き）、特定のコマンドの手順ならそのスキル、それ以外の仕組みや経緯の説明（人も読むもの）は `docs/`。
      - `CLAUDE.md` から `docs/` へは `@` ではなく普通のリンクで、「〜するときは、先に〜を読む」という指示の形で書くこと。`@` は起動時に展開され毎回読み込まれるため。読まれないことが多いドキュメントは `.claude/rules/` へ移すか `@` に切り替えること。
    - 「仕組みで守らせているルール」の一覧: FSD の import ルール（ESLint `no-restricted-imports`）、CSS のクラス名・ネスト・色の直接指定（Stylelint）、アクセシビリティ（`eslint-plugin-jsx-a11y`）、`useMemo` / `useCallback` の禁止（ESLint。React Compiler が有効なため）、`app/api/` の編集禁止（`.claude/settings.json` の `permissions.deny`。Claude Code の編集ツールにだけ効き、シェルからの書き換えは防げないこと）。それぞれ設定ファイルへのリンクを付ける。
  - `docs/architecture.md`: `CLAUDE.md` の「ディレクトリ構成」にしかない内容があれば足す（FSD v2.1 であること、`app/api/` が FSD の `api-routes` 構成の対象外であることなど）。「その他のルール」のスタイルに関する行は、置き場所（`src/_app/styles/`、各スライスの `ui/`、`src/shared/ui/`）だけを残し、書き方の規約は `.claude/rules/ui-component.md` へのリンクにする。「クラス名は `CLAUDE.md` の「CSS 命名規則」に従う」を `.claude/rules/ui-component.md` への参照に直す。
  - `.claude/rules/ui-component.md`: `CLAUDE.md` の 55〜73 行と 89 行を移す。
    - frontmatter は `paths:` だけにし、`"src/**/*.tsx"` と `"src/**/*.scss"` を並べる（UI コンポーネントや SCSS を読んだときに読み込まれる）。
    - 本文の先頭に、何のルールか（UI コンポーネントと SCSS の書き方の規約）を 1 行で書く。
    - Stylelint・ESLint で検査されるルール（クラス名、ネスト、色の直接指定、アクセシビリティ）と、lint では検査できないルール（`s.xxx` で指定し `clsx` で結合する、`className` を受け取り `clsx(s.root, className)` で結合する、ライトテーマのみ、足りない色は既存の変数で代用できないか確かめてから `globals.scss` に足す、`*.module.scss` をコンポーネントの隣に置く、SCSS パーシャルの `@use`）を分けて書く。
    - ルールを変えるときは `stylelint.config.mjs` とこのファイルを合わせて更新することを書く。
  - `.claude/rules/api-types.md`: `CLAUDE.md` の 87 行を移す。
    - frontmatter は `paths:` だけにし、`"src/shared/api/**"` と `"app/api/**"` を並べる（API のデータ取得のコードや、API の実装・仕様を読んだときに読み込まれる）。
    - 本文の先頭に、何のルールか（API のレスポンス型と、API の仕様の確かめ方）を 1 行で書く。
    - レスポンス型は `src/shared/api/` に手書きしていること、仕様は `app/api/v1/spec/swagger.yml/swagger.yml`（開発サーバー起動中は `http://localhost:3000/api/v1/spec`）を見ること、`UpdateTask`（`PATCH /users/tasks/{id}` のリクエスト）は誤っているため `app/api/v1/users/tasks/[id]/route.js` と `app/api/datastore/models/task.ts` の `assign()` を見ること（`projectId`・`title`・`description`・`status`・`deadline` を受け付ける）、`app/api/` は改変しないこと、`src/shared/api/index.ts` の `merge=union`（詳細は `docs/development.md`）。
  - `stylelint.config.mjs`: 先頭のコメントの参照先を `.claude/rules/ui-component.md` に直す（ルールは変えない）。
- 公開 API:
  - `docs/state-management.md` — 状態管理とデータの流れ
  - `docs/development.md` — 開発環境・CI・仕組みで守らせているルール
  - ルール `.claude/rules/ui-component.md`
  - ルール `.claude/rules/api-types.md`

### 第 2 段階

#### タスク 3: CLAUDE.md と README.md を書き直す

- 目的: `CLAUDE.md` を直接書くべきことだけにし、`README.md` を人向けに整理する。
- 担当範囲:
  - `CLAUDE.md`
  - `README.md`
- 要件:
  - `CLAUDE.md`（方針の表に従う）:
    - 「This is NOT the Next.js you know」の節は `<!-- BEGIN:nextjs-agent-rules -->`〜`<!-- END:nextjs-agent-rules -->` を含めて一字一句変えない。
    - 残すもの: よく使うコマンドと変更後の確認（テストフレームワークはない）、コミットメッセージの形式と表、構成の要点（FSD、`app/` は再エクスポートだけ、`@/*` の import、`app/api/` は改変しない）、開発の流れの 1〜2 行と `README.md` へのリンク。
    - 最後に、移した先へのリンクを「〜するときは、先に〜を読む」という指示の形で並べる（「いつ読むか」を添えた一覧ではなく、AI が読み飛ばしにくい指示の形にする）。
      - 新しいファイルの置き場所を決めるときは、先に `docs/architecture.md` を読む。
      - 状態管理（Context）やデータ取得を変えるときは、先に `docs/state-management.md` を読む。
      - CI・lint・Git の設定を変えるとき、または lint などの仕組みで守らせているルールを確かめるときは、先に `docs/development.md` を読む。
      - ドキュメントや規約（`CLAUDE.md`・`docs/`・`.claude/rules/`・スキル）を足す・移すときは、先に `docs/development.md` の「ドキュメントの置き場所」を読む。
      - UI コンポーネント・SCSS の規約は `.claude/rules/ui-component.md`、API の型と仕様の確かめ方は `.claude/rules/api-types.md` にある。対象のファイルを読むと自動で読み込まれるが、新しいファイルを作るだけのときは先に読む。
      - スクリーンショットの撮り方は `/pr` スキルにある。
    - リンクは普通の Markdown のリンク（`[docs/development.md](docs/development.md)`）で書く。`@docs/development.md` のような `@` による読み込みは、起動時に中身が展開されて毎回読み込まれるため使わない。
    - `useMemo` / `useCallback` の指示と、Node のバージョンをそろえる指示は書かない（仕組みで守らせるため）。
  - `README.md`:
    - 構成は、概要、技術スタック、はじめかた（コマンド表）、プレビュー環境、Claude Code での開発の流れ、ドキュメントの順にする。
    - 「プレビュー環境」の、データが再起動で初期状態に戻る説明は残す。
    - 「Claude Code での開発の流れ」は、全体の図と段階の表、事前準備を残す。各段階の節は、人がすること（仕様書の書き方のコツ、プランで確認すること、実装後に `npm run dev` と差分で見ること、PR をマージするのは人）を中心にし、スキルが内部で順に何をするかの番号付きの手順は 1〜2 行の要約と `SKILL.md` へのリンクにする。スクリーンショットに個人情報などが映る画面を撮らない注意は残す。
    - 「スクリーンショットだけ撮る」は残す（人が使うため）。
    - 「要点」の節は消し、「ドキュメント」に `CLAUDE.md`・`docs/architecture.md`・`docs/state-management.md`・`docs/development.md` を並べる。
    - 「関連ファイル」の表に、`.claude/rules/`（対象のファイルを読んだときだけ読み込まれる規約）、`.node-version` を加える。`.claude/settings.json` の説明を「コマンドの許可と、`app/api/` の編集の拒否」に直す。
- 使う公開 API: タスク 1・2 で作ったファイル（`.node-version`、`docs/state-management.md`、`docs/development.md`、`.claude/rules/ui-component.md`、`.claude/rules/api-types.md`）。リンクする前に実際に読み、内容と食い違わないようにする。

#### タスク 4: 既存のスキルとエージェントの参照を直す

- 目的: `CLAUDE.md` から移した内容を、スキル・エージェントが必要なときに読むようにする。
- 担当範囲:
  - `.claude/skills/spec/SKILL.md`
  - `.claude/skills/plan/SKILL.md`
  - `.claude/skills/implement/SKILL.md`
  - `.claude/skills/pr/SKILL.md`
  - `.claude/agents/implementer.md`
  - `.claude/agents/fsd-reviewer.md`
  - `.claude/skills/feature-sliced-design/SOURCE.md`
- 要件:
  - `spec`・`plan`: 「調べる」に、状態管理やデータ取得に関わる機能なら `docs/state-management.md` を読むことを足す。`plan` の「`UpdateTask` の扱いは `CLAUDE.md` を参照」を `.claude/rules/api-types.md` への参照に直す。
  - `implement`: 「準備」で読むものに変わりがあれば直す。サブエージェントへの依頼文に、担当範囲に応じて読むルール（`.claude/rules/ui-component.md`・`.claude/rules/api-types.md`）を書くことを足す。
  - `pr`: 「スクリーンショット」の手順に、`CLAUDE.md` の 22 行の内容（開発サーバーが前提、先頭の `/` を省く理由は Git Bash が `/tasks` を Windows のパスに変換するため、画像は orphan ブランチ `screenshots` に push され PR 本文から参照される、このブランチはマージも削除もしない、詳細は `scripts/pr-screenshots.mjs`）を足す。コミットメッセージの表は `CLAUDE.md` に残るので、その参照はそのままでよい。
  - `implementer`: 「始める前に」に、担当範囲に UI コンポーネント・SCSS が含まれるときは `.claude/rules/ui-component.md` を、`src/shared/api/` が含まれるときは `.claude/rules/api-types.md` を読むことを足す（新しいファイルを作るだけで対象のファイルを読まない場合、ルールが自動で読み込まれないことがあるため）。「`CLAUDE.md` に書いた例外」を `docs/architecture.md` への参照に直す（`app/api/` は `permissions.deny` でも編集が拒否されることも書く）。
  - `fsd-reviewer`: 手順の 1. に `.claude/rules/ui-component.md` を読むことを足す。「`CLAUDE.md` に書いた例外」を `docs/architecture.md` への参照に直す。lint で検査されるようになった `useMemo` / `useCallback` は確認項目に入れない。冒頭の「lint でも検査されます」の一覧に、`useMemo` / `useCallback` の禁止を足す。
  - `SOURCE.md`: 「`CLAUDE.md` と `docs/architecture.md` の規約が、このスキルより優先する」は、移した後も正しければそのまま、必要なら `docs/` 全体と `.claude/rules/` を含める形に直す。`feature-sliced-design` の `SKILL.md`・`references/` は編集しない。
- 使う公開 API: タスク 2 で作った `.claude/rules/ui-component.md`・`.claude/rules/api-types.md` と `docs/state-management.md`。名前と置き場所は第 1 段階のとおり。

## 判断した点

- 移す先の名前は `docs/state-management.md`・`docs/development.md`、ルールは `.claude/rules/ui-component.md`・`.claude/rules/api-types.md` とした（仕様書の例のとおり）。
- `ui-component` の `paths:` は `src/**/*.tsx` と `src/**/*.scss` にした。`.tsx` には Context の Provider など UI でないものもあるが、UI コンポーネントだけを指すパターンがないため、広めに取る（読み込まれても数十行）。
- `api-types` の `paths:` には `app/api/**` も含めた。API の仕様を確かめるために `route.js` や swagger.yml を読んだときにも、`UpdateTask` の注意が読み込まれるようにするため。
- `CLAUDE.md` から `docs/` へのリンクは、`@` による読み込みではなく普通のリンクにし、「〜するときは、先に〜を読む」という指示の形で書く。`docs/` を読むかは AI の判断に任されるため、指示の形にして読み漏れを減らす。使ってみて読まれないことが多いドキュメントがあれば、そのときに `.claude/rules/` へ移すか `@` に切り替える。
- サブエージェント（worktree で動く `implementer`）でパス指定のルールが自動で読み込まれるかは、ドキュメントで確かめきれなかった。そのため `implementer` の定義でも、担当範囲に応じてルールのファイルを読むよう指示する。
- タスクは FSD のレイヤーではなく「移す先を作る（第 1 段階）」「移す元と参照を直す（第 2 段階）」で分けた。第 2 段階が、第 1 段階でできたファイルを実際に読んでからリンクできるようにするため。
- `permissions.deny` は、本体用の `/app/api/**` に加えて、worktree 用の `/.claude/worktrees/*/app/api/**` も足す。worktree で動くサブエージェントで、`/` がどこを指すか（本体のルートか worktree のルートか）をドキュメントからは確かめきれなかったため、両方を書いておく。統合後（`/implement` の 4.）に、本体の会話で `app/api/` のファイルの Edit が拒否されることを確かめ、worktree での動作は確かめられなければ報告する。
- `permissions.deny` は Claude Code の編集ツールにだけ効き、`sed -i` などのシェルからの書き換えは防げない。これは `docs/development.md` に書き、`CLAUDE.md` の「改変しない」の 1 行も残す。
- `useMemo` / `useCallback` の import の禁止は、上書きを避けるため FSD の `no-restricted-imports` と同じ設定に `paths` として加える。
- Node のバージョンは `.node-version` に一本化する。Netlify のドキュメントで、`.node-version` が `NODE_VERSION` 環境変数より優先されることを確かめた。`.nvmrc` ではなく `.node-version` にしたのは、`actions/setup-node` と Netlify の両方が読め、中身がバージョンだけで済むため。
- `docs/architecture.md` の「その他のルール」にあるスタイルの行は、置き場所（FSD の構成に関わる）だけを残し、書き方の規約は `.claude/rules/ui-component.md` に寄せる。
- `.claude/` は Prettier の対象外（`.prettierignore`）のため、ルール・スキル・エージェントは整形されない。表などは手で整える。
