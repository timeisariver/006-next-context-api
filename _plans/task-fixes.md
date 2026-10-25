# タスクまわりの不具合修正 実装プラン

- 仕様書: [\_specs/task-fixes.md](../_specs/task-fixes.md)
- ブランチ: `feature/task-fixes`

## 方針

1 の id の重なりは、`TaskCreateForm`（`src/_app/layouts/`）と `TaskDetailForm`（`src/_pages/task-detail/ui/`）が同じ固定の id 文字列を書いていることが原因である。どちらも React の `useId()` で接頭辞を作り、`htmlFor`・`id`・`aria-labelledby` をそこから組み立てる。共通の hooks などは作らず、各コンポーネントの中で直す（id を使う場所がこの 2 つだけで、切り出すほどの処理ではないため）。

2 は `app/projects/[slug]/page.tsx` と同じように、`app/tasks/[id]/page.tsx` で `<TaskDetail key={id} id={id} />` とする。`TaskDetail` の中は変えない。

変更はどちらも数行で、触るファイルも 3 つだけなので、タスクは分けずに 1 件にし、コミットを要件ごとに分ける。

## タスク

### 第 1 段階

#### タスク 1: フォームの id を分け、タスク詳細に key を付ける

- 目的: タスク詳細でタスク追加モーダルを開いても id が重ならないようにし、タスク詳細をタスクの id ごとに作り直す。
- 担当範囲:
  - `src/_app/layouts/TaskCreateForm.tsx`
  - `src/_pages/task-detail/ui/TaskDetailForm.tsx`
  - `app/tasks/[id]/page.tsx`
- 要件:
  - 要件 1（フォームの入力欄の id が重ならないようにする）のすべて
    - `TaskCreateForm` の `task-project`・`task-project-label`・`task-title`・`task-description`・`task-deadline`・`task-status`・`task-status-label` を、`useId()` で作った接頭辞から組み立てた id に置き換える（`task-title` は今は重ならないが、同じフォームの中で書き方を揃える）。
    - `TaskDetailForm` の `task-project`・`task-project-label`・`task-deadline`・`task-status`・`task-status-label`・`task-description` も同じように置き換える。
    - `<label htmlFor>`・入力欄の `id`・`Select` の `id` と `aria-labelledby` が、それぞれ自分のフォームの id を指すようにする。
    - 見た目・文言・`autoFocus` などの動作は変えない。
  - 要件 2（タスク詳細を、タスクの id ごとに作り直す）のすべて
    - `app/tasks/[id]/page.tsx` で `TaskDetail` に `key={id}` を渡す。
- コミット: 要件ごとに 1 つずつ（2 コミット）
  1. `🩹 fix: タスク追加モーダルとタスク詳細のフォームの id が重ならないようにする`
  2. `🩹 fix: タスク詳細をタスクの id ごとに作り直す`
- 公開 API: なし

## 判断した点

- id は `useId()` で作る。固定の別名（`task-create-project` など）に変える方法もあるが、同じフォームを 2 つ同時に描いたときにまた重なるため、React の推奨どおり `useId()` にした。
- `useId()` は 1 フォームにつき 1 回呼び、`${id}-project` のように接尾辞を付けて各要素の id にする。入力欄ごとに `useId()` を呼ぶより、どの id が同じフォームのものかが読みやすいため。
- `task-title` はモーダルにしかなく今は重ならないが、同じフォームの中で書き方が混ざらないように合わせて置き換える。
- 共通の hooks や定数は作らない。id を使う場所が 2 つのコンポーネントだけで、各所 1 行で済むため。
- `app/tasks/[id]/page.tsx` に `key` を渡すのは、「ルートファイルは再エクスポートするだけ」という取り決めの範囲内とする（`app/projects/[slug]/page.tsx` が既に同じ書き方をしている）。
