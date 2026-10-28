# ヘッダーのタスク検索 実装プラン

- 仕様書: [\_specs/header-search.md](../_specs/header-search.md)
- ブランチ: `feature/header-search`

## 方針

- 検索欄はヘッダー（`src/_app/layouts/Header.tsx`）にしかないため、検索欄と検索結果の一覧は `src/_app/layouts/HeaderSearch.tsx` に新しいコンポーネントとして切り出し、`Header.tsx` からは `<HeaderSearch />` を置くだけにする。タスク追加モーダル（`TaskCreateForm.tsx`）と同じく、ヘッダーだけで使う部品は `_app/layouts` に置く。
- API にはキーワードで絞り込むパラメーターがないため、すべてのタスクを取得してからクライアント側で絞り込む。
- 「すべてのステータスの、すべてのタスクを取る」処理は、業務ルールを含まないデータ取得なので `src/shared/api/task.ts` に `getAllTasks()` として足す（`docs/architecture.md` の「データ取得と型の置き場所」に従う）。
  - API は `status` を 1 つしか正しく受け取れない（配列の形では無視される）ため、ステータスごと（`scheduled`・`completed`・`archived`）に `getTasks()` を呼んで結果をつなげる。3 つは `Promise.all` で並列に呼ぶ。
  - 1 回目は `limit: 100` で取得し、`pageInfo.totalCount` が取得した件数より多いときだけ、`limit: totalCount` で取り直す（初期データは 100 件なので、通常は 3 リクエストで済む）。
- 絞り込み・並べ替え・10 件への切り詰めは、`HeaderSearch.tsx` の中の関数で行う。ほかに使う箇所がないので `shared/lib` には切り出さない。
- 取得のタイミングは「検索結果の一覧が、閉じた状態から開いたとき」（＝検索を始めたとき）にする。1 文字目を入力したとき、文字が残ったまま検索欄に戻ったとき、「×」で消してから入力し直したときが当たる。一覧を開いているあいだの入力では取得せず、手元のデータで絞り込む。検索しないときは何も取得しない。
  - タスクの作成（モーダル）や詳細ページでの編集・削除は、一覧を閉じているあいだに行われるため、次に一覧を開いたときの取得で反映される。そのため `useTaskChanges()` の `revision` は使わない。

## タスク

### 第 1 段階

#### タスク 1: すべてのタスクを取得する関数を足す

- 目的: ステータスを問わず、すべてのタスクを 1 回の呼び出しで取れるようにする。
- 担当範囲: `src/shared/api/task.ts`、`src/shared/api/index.ts`
- 要件:
  - 「完了」「アーカイブ」のタスクも含めて、すべてのタスクを検索する（の、データ取得の部分）
- 公開 API（`@/shared/api`）:
  - `getAllTasks(): Promise<Task[]>` — `scheduled`・`completed`・`archived` のタスクをすべて返す。並び順は保証しない（呼び出し側で並べ替える）。どれか 1 つでも取得に失敗したら reject する。
  - `index.ts` には `export { getAllTasks } from "./task";` を新しい行で足す（`merge=union` のため、既存の行は書き換えない）。

### 第 2 段階

#### タスク 2: ヘッダーの検索欄と検索結果の一覧

- 目的: ヘッダーの検索欄に入力すると、当てはまるタスクが検索欄の下に一覧で表示され、そこからタスク詳細を開けるようにする。
- 担当範囲:
  - `src/_app/layouts/HeaderSearch.tsx`（新規）
  - `src/_app/layouts/HeaderSearch.module.scss`（新規）
  - `src/_app/layouts/Header.tsx`（検索欄の `<div className={s.search}>…</div>` を `<HeaderSearch />` に置き換える。`Search` アイコンの import を外す）
  - `src/_app/layouts/Header.module.scss`（`.search`・`.searchIcon`・`.searchInput` を `HeaderSearch.module.scss` に移して消す）
- 要件:
  - 「検索欄」の 5 項目すべて
  - 「検索の対象」の 4 項目すべて
  - 「検索結果の一覧」の 7 項目すべて
- 使う公開 API:
  - `getAllTasks()`、`Task` 型（`@/shared/api`）
  - `toDisplay(value: string): string`、`toDateString(value: string): string`（`@/shared/lib`）
  - `X`・`Search` アイコン（`lucide-react`）、`Link`（`next/link`）
- 実装の要点:
  - `HeaderSearch` は `className?: string` を受け取り、ルート要素で `clsx(s.root, className)` と結合する。ルート要素は検索欄と一覧を包む `position: relative` の要素にする。
  - 状態: 入力値（`query`）、一覧を開いているか（`isOpen`）、取得結果（未取得・取得中・成功・失敗）。一覧は「`isOpen` かつ `query.trim()` が空でない」ときだけ表示する。
  - 取得: 一覧が閉じた状態から開いたとき（`isOpen && query.trim() !== ""` が false から true に変わったとき）に `getAllTasks()` を 1 回呼ぶ。開いているあいだの入力では呼ばない。入力・フォーカス・「×」のイベントハンドラーの中で「この操作で一覧が開くか」を判断して呼び、`useEffect` で状態の変化を監視しない。取り直しのあいだは前の結果を表示したままにし、「読み込み中…」は、まだ一度も取得できていないときだけ出す。古い取得の結果で上書きしないよう、取得のたびに連番を付けて最新のものだけを反映する。
  - 絞り込み: タイトルとキーワードの両方を `normalize("NFKC").toLowerCase()` してから `includes` で比べる（NFKC で半角カナ → 全角カナ、全角英数字 → 半角英数字になる）。キーワードは前後の空白を取り除いてから比べる。
  - 並び順: `toDateString(deadline)` の昇順。同じ日のときはタイトルを `localeCompare(…, "ja", { numeric: true })` で比べる（「タスク 2」が「タスク 10」より前）。並べたあと先頭の 10 件だけを表示する。
  - 行: 各行は `/tasks/<id>` への `Link`。1 行目にタイトル、2 行目の左に `task.project.name`、右に `toDisplay(task.deadline)`。押したら一覧を閉じる（入力は残す）。
  - 一覧の表示: 0 件は「一致するタスクはありません」、未取得のまま取得中は「読み込み中…」、失敗は「読み込みに失敗しました」。
  - 「×」ボタン: `query` が空でないときだけ表示する `<button type="button" aria-label="検索をクリア">`。押すと `query` を空にして一覧を閉じ、入力欄にフォーカスを戻す。
  - 閉じる操作: 入力欄・行で Esc を押すと閉じる（入力は残し、フォーカスは入力欄へ）。ルート要素の `onBlur` で、`relatedTarget` がルート要素の外（または null）なら閉じる。これで外側のクリックと、Tab で一覧の外に出たときの両方を扱う。入力欄に再びフォーカスしたら開く。
  - Enter: 入力欄は `<form>` に入れないので、Enter を押しても何も起きない。
  - 一覧のパネルは `position: absolute; top: 100%`（少し間を空ける）で検索欄と同じ幅にし、`z-index` でページの内容より手前に出す。Toast（`z-index: 100`）より小さい値にする。
  - アクセシビリティ: 一覧は `<ul>`、各行は `<li>` の中の `Link`。状態の文言（読み込み中・0 件・失敗）は `<p>` で出す。jsx-a11y のルールに沿う（`onBlur` を付けるのは `<div>` だが、ハンドラーはフォーカスの移動を受けるだけなので `no-static-element-interactions` には当たらない想定。当たる場合は理由をコメントに書いて無効にする）。
  - スタイル: パネルは `--color-surface`、`--shadow-card`、角丸 12px（検索欄と揃える）。行のタイトルは 14〜15px・`--color-text-sub`、プロジェクト名と期限日は 11px 前後・`--color-text-muted`。行のホバーとフォーカスの背景は `--color-primary-bg`。「×」は `--color-navy`、入力欄の右の余白を「×」の分だけ広げる。

## 判断した点

- **ステータスごとに 3 回取得する。** API は `status` に配列を渡すと無視して「未完了」だけを返すため。`status=scheduled,completed,archived` のような 1 つの文字列を渡すと、API の `includes` の判定でたまたま全件が返るが、API の不具合に頼るため使わない。
- **件数の上限は `totalCount` で決める。** 固定の大きな `limit` を渡すのではなく、1 回目の `totalCount` を見て足りなければ取り直す。
- **取得は検索を始めたとき（一覧が開いたとき）に 1 回。** 検索にはすべてのタスクが要る（100 件で約 83 KB、圧縮後は約 4 KB）。入力のたびに取ると API を何度も呼び、フォーカスで取ると検索しないときにも取るため、一覧が開くときだけにした。作成・編集・削除は一覧を閉じているあいだに起きるので、次に開いたときの取得で反映され、`revision` は使わなくてよい。
- **同じ期限日のタスクはタイトルの自然順で並べる。** 初期データはすべて同じ期限日のため、期限日だけでは 10 件の選ばれ方が決まらない。
- **行を押したり Esc で閉じたりしても、入力は残す。** 仕様書の「入力した文字は残る」（Esc・外側のクリック）に揃えた。
- **検索欄のコンポーネントを `Header.tsx` から切り出す。** 状態と取得の処理が増え、`Header.tsx` のタスク追加・トーストの処理と混ざるため。
