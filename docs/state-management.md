# 状態管理とデータの流れ

状態管理は React Context で行う。Context で共有するのは、プロジェクト一覧と、タスクが変わったことの知らせ（`revision`）だけ。

## Provider の構成

`src/_app/layouts/RootLayout.tsx` が、次の順に Provider でアプリ全体を包む。

```
ProjectsProvider        # entities/project（プロジェクト一覧）
  TaskChangesProvider   # entities/task（タスクが変わったことの知らせ）
    ...
```

## プロジェクト一覧（`ProjectsProvider`）

- 各所は `useProjects()` で `projects`・`isLoading`・`error`・`refreshProjects` を読む。
- `ProjectsProvider` はマウント時に `shared/api` の `getProjects()`（axios で `/api/v1/users/projects`）を 1 回呼ぶ。

プロジェクトはタスクの件数などの集計（`stats`）を持つ。ただし API は初期データの固定値を返し、タスクを作成・更新・削除しても計算し直さない。そのため、タスクを変えたあとに `refreshProjects()` を呼んでも表示は変わらない。新しく `refreshProjects()` を呼ぶ箇所を足す必要はない（タスク詳細の更新・削除のあとに呼んでいるのは、既存のまま残している）。

## タスクが変わったことの知らせ（`TaskChangesProvider`）

- ヘッダーのタスク追加モーダルでタスクを作成すると、`notifyTasksChanged()` で `revision` を 1 増やす。
- ダッシュボードと `/tasks` のタスク一覧は、`useTaskChanges()` の `revision` が変わったら取り直す。
- Context に載せるのは `revision` だけで、タスクそのものは載せない。

## Context に載せないデータ

タスク・統計・プロジェクト詳細・タスク詳細は Context に載せない。`_pages` のクライアントコンポーネントが、`shared/api` の関数で直接取得する。

## API のデータの置き場所

API のデータはサーバーのメモリ（`globalThis.__datastore`）にある。開発サーバーを再起動すると初期データに戻る。Netlify 上でも、再起動のたびに戻ることがある。
