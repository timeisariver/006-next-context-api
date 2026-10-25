# データ取得処理の共通化

## 目的

API からデータを取得するコンポーネントが、それぞれ `isLoading`・`error` の `useState` と、`useEffect` の中の `try` / `catch` / `finally` を同じ形で書いている。これを共通の hooks にまとめ、同じ書き方の繰り返しをなくす。データ取得を足すときも、hooks を呼ぶだけで済むようにする。見た目と動作は変えない。

今、同じ形で書いている箇所は次の 5 つ。

| 箇所                                             | 取得するもの           | 失敗したときの文言       |
| ------------------------------------------------ | ---------------------- | ------------------------ |
| `src/entities/project/model/ProjectsContext.tsx` | プロジェクト一覧       | 読み込みに失敗しました   |
| `src/_pages/project-detail/ui/ProjectDetail.tsx` | プロジェクト詳細       | 読み込みに失敗しました   |
| `src/_pages/task-detail/ui/TaskDetail.tsx`       | タスク詳細             | 読み込みに失敗しました   |
| `src/_pages/home/ui/DashboardTasks.tsx`          | ダッシュボードのタスク | 読み込みに失敗しました   |
| `src/_pages/home/ui/Summary.tsx`                 | 進捗サマリーの統計     | 進捗の取得に失敗しました |

## 対象ページ

見た目は変わらないが、データ取得を書き換えるページすべてで、今と同じに表示されることを確かめる。

- `/`（ダッシュボード: 進捗サマリー、タスク一覧、最近のプロジェクト）
- `/projects`（プロジェクト一覧）
- `/projects/<slug>`（プロジェクト詳細）
- `/tasks/<id>`（タスク詳細）
- 全ページ共通のサイドバー（プロジェクト一覧）

## 要件

見た目・文言・API の呼び方は変えない。

### 共通の hooks

- [ ] 上の表の 5 か所が、`isLoading`・`error` を自分で `useState` せず、共通の hooks を使ってデータを取得する
- [ ] hooks を使うコンポーネントは、今と同じく読み込み中・失敗・取得できたときの 3 つを出し分けられる（取得したデータ・`isLoading`・`error` を受け取れる）
- [ ] 失敗したときの文言は、今と同じく箇所ごとに変えられる（進捗サマリーだけ「進捗の取得に失敗しました」）
- [ ] hooks は、今の 5 か所と同じく、画面に出たときに 1 回だけ取得する

### ページごとの動作（今と同じ）

- [ ] ダッシュボードの進捗サマリーは、「読み込み中…」のあとにグラフと集計が表示される。取得に失敗すると「進捗の取得に失敗しました」、データが 0 件なら「データがありません」と表示される
- [ ] ダッシュボードのタスク一覧は、「読み込み中…」のあとに 20 件までのタスクと「あと N ページ」のリンクが表示される。失敗すると「読み込みに失敗しました」、0 件なら「タスクはありません」と表示される
- [ ] ダッシュボードのタスク一覧で、ステータスなどを変えると、今と同じくその行が更新後の内容で表示される（取得したあとに一覧を書き換えられる）
- [ ] プロジェクト詳細（`/projects/<slug>`）とタスク詳細（`/tasks/<id>`）は、「読み込み中…」のあとに内容が表示され、失敗または見つからないときは「読み込みに失敗しました」と表示される
- [ ] サイドバー・プロジェクト一覧（`/projects`）・ダッシュボードの最近のプロジェクトは、今と同じく `useProjects()` の `projects`・`isLoading`・`error` で出し分けられる（`useProjects()` が返す値の形は変えない）
- [ ] タスク詳細で更新・削除したあとの `refreshProjects()` は今と同じく動く（読み込み中の表示にはせず、失敗しても今の一覧を残す）

## 対象外

- 同じコンポーネントが表示されたまま取得の引数（slug・id など）が変わったときの対応（読み込み中に戻す、前の引数の結果を捨てるなど）。プロジェクト詳細・タスク詳細はルートで `key` を付けて作り直しており、ほかの 3 か所は引数を持たないため、このアプリでは起きない。必要になったら、そのときに足す
- タスク一覧ページ（`/tasks`、`TasksContent.tsx`）のデータ取得の書き換え。範囲外のページのリダイレクト、失敗しても件数（`counts`）を残す処理、表示件数・ページごとの結果の見分けなど、ほかの 5 か所にない処理を持つため、hooks に載せても減るコードが少なく、hooks が複雑になる。hooks の形が固まってから、別の PR で検討する
- タスク詳細の更新・削除（`TaskDetailForm.tsx` の `isSaving`・`isDeleting`・`error`）など、データ取得ではない送信処理の共通化
- TanStack Query・SWR などのデータ取得ライブラリの導入
- 読み込み中・失敗の表示（`<p>読み込み中…</p>` など）を共通のコンポーネントにすること
- 取得のやり直し（リトライ）やキャッシュなど、今ない機能の追加
- `RecentProject` と `ProjectCard`、2 つの `Pagination` の共通化
- 見た目・文言の変更、不具合の修正（見つけても、この仕様書では直さない）

## 使う API・データ

API の呼び方は変えない（`shared/api` の関数をそのまま使う）。

- `GET /api/v1/users/projects`（`getProjects()`）— プロジェクト一覧（`ProjectsProvider`）
- `GET /api/v1/users/projects/{slug}`（`getProject()`）— プロジェクト詳細
- `GET /api/v1/users/tasks/{id}`（`getTask()`）— タスク詳細
- `GET /api/v1/users/tasks?limit=20`（`getTasks()`）— ダッシュボードのタスク一覧
- `GET /api/v1/users/stats`（`getStats()`）— 進捗サマリー

## デザイン・補足

- 見た目は変わらないので、Figma はない。PR のスクリーンショットは、変わっていないことの確認として撮る。
- 今の書き方は 5 か所とも、`isLoading` の初期値が `true`、`error` の初期値が `null` で、`useEffect` の中で取得し、`catch` で `error` に文言を入れ、`finally` で `isLoading` を `false` にしている。取得したデータの初期値は箇所ごとに違う（`null`・`[]`）。
- `DashboardTasks` は、取得結果から `tasks` と `remainingPages` の 2 つを作り、`tasks` はあとで `handleChange` で書き換えている。
- `ProjectsProvider` は、マウント時の取得に加えて、読み込み中表示にしない `refreshProjects()` を持つ。
- React Compiler が有効なため、hooks の中でも `useMemo` / `useCallback` は手書きしない。
- hooks は `src/shared/lib/` に置き、`@/shared/lib` から export する。`entities` と `_pages` の両方から使うため `shared` に置く（`docs/architecture.md` の「依存ルール」）。`shared/api` ではなく `shared/lib` にするのは、hooks が特定の API に依存せず、渡された取得関数を呼ぶだけの汎用の処理だから。`docs/architecture.md` でも `lib/` は「UI を持たない関数・hooks」の置き場所としており、`useModal` も `shared/lib` にある。hooks の名前は `/plan` で決める。
