# プロジェクト詳細ページ

## 目的

サイドバーやダッシュボードのプロジェクトから開く、プロジェクト 1 件ぶんの個別ページを作る。プロジェクトのゴールや期限などを 1 画面で確認できるようにする。

## 対象ページ

- `/projects/<slug>`（新規。例: `/projects/programming`）

## 要件

- [ ] `/projects/<slug>` を開くと、`GET /api/v1/users/projects/<slug>` で取得したプロジェクトの詳細が表示される
- [ ] 取得中は「読み込み中…」と表示される（ダッシュボードの「最近のプロジェクト」と同じ表示）
- [ ] 取得に失敗したとき、または存在しない slug のときは「読み込みに失敗しました」と表示される
- [ ] 白い面のカード 1 枚に表示され、左端にプロジェクトの色（`color`）の太い縦線が表示される
- [ ] ページ見出し（`h1`）にプロジェクト名が表示される（小さく太字、プロジェクトの色）
- [ ] 「ゴール:」ラベルの右に、ゴール（`goal`、大きく太字）が表示される
- [ ] ゴールの上に、期限までの残り日数と期限日が「あと 7 日 (2026/10/28)」の形で小さく表示される（残り日数は今日から期限日までの日数）。期限日が今日なら「今日まで」、過ぎていれば「N 日超過」と表示する（例: 「3 日超過 (2026/10/18)」）
- [ ] 「あるべき姿:」ラベルの右に、あるべき姿（`shouldbe`、薄い色の文字）が表示される
- [ ] あるべき姿の下に区切り線があり、その下に「スラッグ:」ラベルと、「/projects/」＋ スラッグ（`slug`）を入れた入力欄の形の表示がある（プロジェクト API に更新がないため、編集はできない表示専用）
- [ ] 下部に、予定の数（`stats.states.scheduled`、カレンダーアイコン）・完了の数（`stats.states.completed`、チェックアイコン）・アーカイブの数（`stats.states.archived`、アーカイブアイコン）が、アイコン + 数の形で縦線で区切られて横に並ぶ（アイコンは `lucide-react` の `Calendar` / `Check` / `Archive`、スクリーンリーダーには隠す `aria-hidden`）
- [ ] サイドバーのプロジェクト、ダッシュボードの「最近のプロジェクト」から `/projects/<slug>` に遷移できる（リンクは実装済み）
- [ ] 「戻る」リンクは置かない
- [ ] デスクトップ表示で崩れない


## 対象外

- プロジェクトの追加・編集・削除、スラッグの編集
- プロジェクト一覧ページ（`/projects`）の作成（`feature/project-list`（PR #7）で作成中）
- このプロジェクトのタスク・マイルストーンの一覧、タスク詳細ページ（`/tasks/<id>`）への導線
- 開始日（`startingAt`）の表示
- モバイル表示への対応

## 使う API・データ

- `GET /api/v1/users/projects/{slug}`（仕様は `/api/v1/spec` を参照）
  - レスポンス: `{ data: Project }`。存在しない slug は 404。
  - `Project` の項目: `name`, `slug`, `goal`, `shouldbe`, `deadline`, `color`, `stats.states.scheduled`, `stats.states.completed`, `stats.states.archived`
  - `programming` の実データでは scheduled = 30、completed = 1、archived = 3（デザインの「30 / 1 / 3」と一致）。
- `src/shared/api/project.ts` に `getProject(slug)` を追加する想定（既存の `getProjects()` と同じ形）。

## デザイン・補足

- Figma のリンクはなし。ユーザーから受け取ったデザイン画像と、統計部分の HTML をもとにしている。
- レイアウト: 左端に色付きの太い縦線（約 5px）の白いカード。ラベル（小さく薄い文字）を左列、値を右列に置く 2 列の並び。上から プロジェクト名 → ゴール → あるべき姿 → 区切り線 → スラッグ → 統計。統計は左下に、アイコン（24px）+ 数を縦線で区切って並べる。
- 色・影は `src/_app/styles/globals.scss` の CSS 変数を使う。プロジェクトの色は、`RecentProject` と同じく `--project-color` として渡す。
- ページ間の import はできないため、`RecentProject` は流用せず、`src/_pages/project-detail/` に専用の UI を作る。
- URL の `slug` は、`ProjectsProvider` の一覧ではなく、個別 API で取得する（直接開いても表示できるようにするため）。
