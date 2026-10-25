# データ取得処理の共通化 実装プラン

- 仕様書: [\_specs/fetch-hooks.md](../_specs/fetch-hooks.md)
- ブランチ: `feature/fetch-hooks`

## 方針

`src/shared/lib/useFetch.ts` に、データ取得の hooks `useFetch` を新しく作り、`@/shared/lib` から export する。仕様書の表にある 5 か所（`ProjectsProvider`・`ProjectDetail`・`TaskDetail`・`DashboardTasks`・`Summary`）の `isLoading`・`error` の `useState` と `useEffect` の `try` / `catch` / `finally` を、`useFetch` の呼び出しに置き換える。`shared/api` の取得関数（`getProjects()` など）はそのまま使い、`useFetch` には取得関数を渡す。

`useFetch` の中身は次のようにする。

- 取得結果（成功ならデータ、失敗なら失敗したこと）を 1 つの state にまとめて持つ。`isLoading` は state に持たず、「結果がまだない」ことから求める。エラー文言も state に持たず、返すときに `errorMessage` から作る。
- `useEffect` の依存配列は `[key]` にし、cleanup で `ignore = true` にして、前の `key` の取得結果を捨てる。
- `key` が変わったときは、レンダー中に前の結果を消す（React の「props が変わったときに state を調整する」書き方）。これで、`useEffect` の中ですぐに `setState` しなくても、読み込み中の表示から始まる。
- 取得関数は毎回のレンダーで新しく作られるため、`useEffectEvent`（React 19.2）で包んで `useEffect` の依存配列に入れない。
- 取得したデータをあとから書き換える `setData` を返す。`DashboardTasks` の `handleChange` で使う。

`shared/lib` に置く理由は仕様書の「デザイン・補足」のとおり。

5 か所はスライスが分かれていて、変更するファイルも重ならないので、第 2 段階はスライスごとに並列に実装する。ただし `project-detail` と `task-detail` は、どちらも 10 行ほどの同じ形の書き換えなので、1 つのタスクにまとめる。

## タスク

### 第 1 段階

#### タスク 1: 共通の hooks `useFetch` を作る

- 目的: データ取得と `isLoading`・`error` の管理を 1 つの hooks にまとめる。
- 担当範囲:
  - `src/shared/lib/useFetch.ts`（新規）
  - `src/shared/lib/index.ts`（`useFetch` を export に追加）
- 要件:
  - 「共通の hooks」のすべて（hooks 側の部分）
    - 取得したデータ・`isLoading`・`error` を返す。
    - 失敗したときの文言を `errorMessage` で変えられる。省略したときは「読み込みに失敗しました」。
    - `key` が変わったら読み込み中（`isLoading: true`、`data: null`、`error: null`）から始まり、前の `key` の取得結果は捨てる。
  - 取得に失敗したときは `data` を `null` のままにし、`error` に文言を入れる（今の 5 か所と同じく、失敗したら取得前の値のまま）。
  - `setData` は、今の `key` のデータがあるとき（取得に成功したあと）だけ書き換える。読み込み中や失敗したあとに呼ばれたときは何もしない。
  - `useMemo` / `useCallback` は使わない（React Compiler が有効なため）。
- コミット: `♻️ refactor: データ取得の共通の hooks useFetch を追加`
- 公開 API（`@/shared/lib`）:

  ```ts
  export function useFetch<T>(
    // 取得し直す単位。変わると読み込み中から取得し直す（引数がなければ固定の文字列）
    key: string,
    fetcher: () => Promise<T>,
    options?: { errorMessage?: string },
  ): {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    // 取得したデータを書き換える（読み込み中・失敗したときは何もしない）
    setData: (update: (prev: T) => T) => void;
  };
  ```

### 第 2 段階

#### タスク 2: プロジェクト一覧の取得を useFetch に置き換える

- 目的: `ProjectsProvider` の初回取得を `useFetch` にする。
- 担当範囲: `src/entities/project/model/ProjectsContext.tsx`
- 要件:
  - 「共通の hooks」: 表の `ProjectsContext.tsx` を `useFetch` に置き換える。
  - 「ページごとの動作」: サイドバー・プロジェクト一覧・最近のプロジェクトの出し分けと、`refreshProjects()` の動作。
    - `useFetch("projects", getProjects)` で取得し、Context には今と同じ `projects`（`refreshProjects()` で取り直した一覧があればそれ、なければ `data ?? []`）・`isLoading`・`error`・`refreshProjects` を渡す。`ProjectsValue` の型と、`createContext` の初期値は変えない。
    - `refreshProjects()` は、`getProjects()` の結果を `ProjectsProvider` の state（取り直した一覧）に入れる。初回の取得に失敗したあとでも入れる。失敗したら今と同じく何もしない（読み込み中にせず、今の一覧を残す）。
- コミット: `♻️ refactor: プロジェクト一覧の取得を useFetch に置き換える`
- 使う公開 API: `useFetch`（`@/shared/lib`）

#### タスク 3: プロジェクト詳細とタスク詳細の取得を useFetch に置き換える

- 目的: `ProjectDetail`・`TaskDetail` の取得を `useFetch` にする。
- 担当範囲:
  - `src/_pages/project-detail/ui/ProjectDetail.tsx`
  - `src/_pages/task-detail/ui/TaskDetail.tsx`
- 要件:
  - 「共通の hooks」: 表の `ProjectDetail.tsx`・`TaskDetail.tsx` を `useFetch` に置き換える。
  - 「ページごとの動作」: プロジェクト詳細とタスク詳細の表示。
    - `useFetch(slug, () => getProject(slug))`、`useFetch(id, () => getTask(id))` とする。
    - 読み込み中・失敗（`error || !data`）・表示の出し分けと文言は今のまま。`TaskDetailForm` の `key={task.id}` も残す。
    - `app/**/page.tsx` の `key` はそのまま残す。
- コミット: `♻️ refactor: プロジェクト詳細とタスク詳細の取得を useFetch に置き換える`
- 使う公開 API: `useFetch`（`@/shared/lib`）

#### タスク 4: ダッシュボードの取得を useFetch に置き換える

- 目的: `DashboardTasks`・`Summary` の取得を `useFetch` にする。
- 担当範囲:
  - `src/_pages/home/ui/DashboardTasks.tsx`
  - `src/_pages/home/ui/Summary.tsx`
- 要件:
  - 「共通の hooks」: 表の `DashboardTasks.tsx`・`Summary.tsx` を `useFetch` に置き換える。`Summary` だけ `errorMessage: "進捗の取得に失敗しました"` を渡す。
  - 「ページごとの動作」: 進捗サマリーとダッシュボードのタスク一覧の表示と、タスクの行の更新。
    - `DashboardTasks` は `useFetch("dashboard-tasks", () => getTasks({ limit: LIMIT }))` で `{ tasks, pageInfo }` を取得する。`tasks` は `data?.tasks ?? []`、`remainingPages` は `pageInfo.totalCount` から今と同じ式で求める（`data` がなければ 0）。`tasks` と `remainingPages` の `useState` はなくす。
    - `DashboardTasks` の `handleChange` は `setData` で `tasks` の該当する行だけを置き換える。
    - `Summary` は `useFetch("stats", getStats, { errorMessage: "進捗の取得に失敗しました" })` とし、`stats` は `data ?? []` にする。それより下の集計と表示は変えない。
- コミット: `♻️ refactor: ダッシュボードの取得を useFetch に置き換える`
- 使う公開 API: `useFetch`（`@/shared/lib`）

## 判断した点

- hooks の名前は `useFetch` にした。データを取得する hooks であることが名前からわかり、既存の `useModal`・`useProjects` とも書き方が揃う。
- 取得し直すきっかけは、依存配列ではなく `key`（文字列）1 つで渡す。依存配列を引数で受け取ると `useEffect` に変数の配列を渡すことになり、`react-hooks/exhaustive-deps` で検査できなくなるため。今の 5 か所はどれも引数が 0〜1 個で、文字列 1 つで足りる。
- `key` が変わったときは、`useEffect` の中ではなくレンダー中に前の結果を消す。`useEffect` の中で `setIsLoading(true)` などを呼ぶと `react-hooks/set-state-in-effect` に引っかかり、前の結果も一瞬表示されるため。最初は `TasksContent` と同じく結果に `key` を持たせて今の `key` と比べていたが、A → B → A と戻ったときに前の A の結果が表示されるとレビューで指摘を受けてレンダー中に消す書き方を足し、`key` の比較は重複するため外した（読みやすさのため）。
- 取得関数は `useEffectEvent` で包む。`useEffect` の依存配列に取得関数を入れると、毎回のレンダーで新しい関数になり、取得が繰り返されるため。React 19.2.8（`useEffectEvent` が安定版）を使っている。
- `setData` は、取得に成功したあとだけ書き換える。成功前のデータを書き換える使い方が `DashboardTasks` にないため。
- `ProjectsProvider` の `refreshProjects()` は `setData` を使わず、取り直した一覧を `ProjectsProvider` の state に持つ（レビューを受けて変更）。`setData` は初回の取得に失敗したあとは何もしないため、`setData` で入れると、初回に失敗してから取り直しに成功したとき、タスク追加モーダルのプロジェクトのプルダウンやタスクの表のプロジェクト名が空のままになり、今の動作と変わってしまう。`useFetch` に「取り直す」機能も足さない。読み込み中の表示にしない・失敗しても今の一覧を残すという動作が、`ProjectsProvider` だけのものだから。
- `DashboardTasks` は、`getTasks()` の結果（`{ tasks, pageInfo }`）をそのまま `data` として持ち、`remainingPages` はレンダーのたびに求める。`useState` を 2 つ残すより、取得結果を 1 か所にまとめたほうがわかりやすいため。
- 失敗したときの文言の初期値「読み込みに失敗しました」は `useFetch` の中に持つ。5 か所のうち 4 か所が同じ文言のため。
- プロジェクト詳細とタスク詳細は、2 つのスライスにまたがるが、どちらも同じ形の小さな書き換えなので 1 タスクにまとめた。
