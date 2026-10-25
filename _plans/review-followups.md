# レビュー指摘の反映 実装プラン

- 仕様書: [\_specs/review-followups.md](../_specs/review-followups.md)
- ブランチ: `feature/review-followups`

## 方針

- 仕様書の「進め方とコミット」に従い、レビューコメント 1 件を 1 タスクにする。タスク同士が同じファイルを触るため、**1 段階に 1 タスク**の 5 段階で順番に実装する。各タスクは 1 コミットで、前の段階を統合したあとの HEAD をベースにする（統合は fast-forward になり、コメントごとのコミットが一列に並ぶ）。
- コミットの本文には、対応したレビューコメントの PR 番号（例: `レビュー: PR #4`）を書く。
- 業務に依存しない日付の処理と開閉状態の hooks は、新しく作る `shared/lib` セグメントに置く。`shared` はスライスを持たないので、`shared/lib/index.ts` を Public API にする（`@/shared/lib` で import する）。ESLint の FSD ルールは `@/shared/lib` を新たに設定しなくてもそのまま通る。
- 汎用のモーダル枠と自作プルダウンは `shared/ui` に、既存の `DashboardHead`・`MoreLink` と同じく `shared/ui/<Name>/<Name>.tsx` の形で置く。
- ステータスの選択肢と「今のプロジェクトを選択肢に残す」処理はタスクの業務ルールなので `entities/task` に置く。`_app/layouts` のタスク追加フォームからも `@/entities/task` 経由で使える（`_app` は `entities` を import してよい）。
- 日付の変換方法は変えない。`dayjs` を使っている箇所は `dayjs` のまま `shared/lib/date.ts` の関数に包み、文字列の切り出しは切り出しのまま移す。

## タスク

### 第 1 段階

#### タスク 1: 進捗サマリーの取得を async/await で書く（PR #4）

- 目的: `Summary` の統計の取得を `.then` / `.catch` / `.finally` から async/await に書き直す。
- 担当範囲: `src/_pages/home/ui/Summary.tsx`
- 要件: 要件 3 のすべて
- 公開 API: なし
- 補足: `useEffect` の中で `async function init()` を定義して呼ぶ形にし、`src/entities/project/model/ProjectsContext.tsx` の `init()` と書き方を揃える（try で `setStats(await getStats())`、catch で `setError("進捗の取得に失敗しました")`、finally で `setIsLoading(false)`）。
- コミット: `♻️ refactor: 進捗サマリーの取得を async/await で書く`

### 第 2 段階

#### タスク 2: 日付まわりの関数を shared/lib/date.ts にまとめる（PR #8）

- 目的: 各コンポーネントに散らばった日付の整形・計算を `shared/lib/date.ts` に集め、各所はそれを使う。
- 担当範囲:
  - 追加: `src/shared/lib/date.ts`、`src/shared/lib/index.ts`
  - 削除: `src/entities/task/lib/date.ts`（`src/entities/task/lib/` ごと）
  - 変更: `src/entities/task/index.ts`（`toDateString`・`toDisplay` の export を消す）、`src/entities/task/ui/DeadlineCell.tsx`、`src/_pages/task-detail/ui/TaskDetailForm.tsx`、`src/_app/layouts/SidebarProject.tsx`、`src/_app/layouts/TaskCreateModal.tsx`（`today()` だけ）、`src/_pages/home/ui/RecentProject.tsx`、`src/_pages/home/ui/Summary.tsx`、`src/_pages/projects/ui/ProjectCard.tsx`、`src/_pages/project-detail/ui/ProjectDetailCard.tsx`
  - ドキュメント: `docs/architecture.md`（ディレクトリ構成の図の `shared/` に `lib/` を足す）
- 要件: 要件 4 のすべて
- 公開 API（`@/shared/lib`）:
  - `toDateString(value: string): string` — `"2026-10-28T12:34:56+09:00"` の先頭 10 文字（`"2026-10-28"`）。タイムゾーン変換はしない（今の `entities/task/lib/date.ts` と同じ実装）
  - `toDisplay(value: string): string` — `toDateString` の `-` を `/` にしたもの（`"2026/10/28"`）
  - `formatDate(value: string, format?: string): string` — `dayjs(value).format(format)`。`format` の既定値は `"YYYY/MM/DD"`。サマリーのラベル（`"M / DD"`）と期間（`"YYYY-MM-DD"`）もこれを使う
  - `formatRemaining(deadline: string): string` — 今の `ProjectDetailCard` の `formatRemaining` をそのまま移す（「あと N 日」「今日まで」「N 日超過」）
  - `today(): string` — ローカル時刻の今日を `"YYYY-MM-DD"` で返す。今の `TaskCreateModal` の `today()` をそのまま移す
- 補足: 移したあと、`dayjs` を import するのは `shared/lib/date.ts` だけになる。
- コミット: `♻️ refactor: 日付まわりの関数を shared/lib/date.ts にまとめる`

### 第 3 段階

#### タスク 3: 期限日の入力の変換を DeadlineCell の外に出す（PR #2）

- 目的: `DeadlineCell` の中の `parseInput` を `shared/lib/date.ts` に移す。編集中の状態（`isEditing`・`draft`）と保存の流れは `DeadlineCell` に残す。
- 担当範囲: `src/shared/lib/date.ts`、`src/shared/lib/index.ts`、`src/entities/task/ui/DeadlineCell.tsx`
- 要件: 要件 1 のすべて
- 公開 API（`@/shared/lib`）:
  - `parseSlashDate(value: string): string | null` — `"2026/11/04"`（前後の空白は無視、月日は 1 桁も可）を `"2026-11-04"` にする。日付として存在しない・形式が違うときは `null`。今の `parseInput` と同じ実装
- コミット: `♻️ refactor: 期限日の入力の変換を DeadlineCell の外に出す`

### 第 4 段階

#### タスク 4: タスク追加モーダルを開閉の hooks・枠・フォームに分ける（PR #9）

- 目的: 今の `TaskCreateModal` を、開閉状態の hooks（`shared/lib`）、モーダルの枠（`shared/ui/Modal`）、タスク追加のフォーム（`_app/layouts/TaskCreateForm`）に分ける。
- 担当範囲:
  - 追加: `src/shared/lib/useModal.ts`、`src/shared/ui/Modal/Modal.tsx`、`src/shared/ui/Modal/Modal.module.scss`、`src/_app/layouts/TaskCreateForm.tsx`、`src/_app/layouts/TaskCreateForm.module.scss`
  - 削除: `src/_app/layouts/TaskCreateModal.tsx`、`src/_app/layouts/TaskCreateModal.module.scss`
  - 変更: `src/shared/lib/index.ts`、`src/shared/ui/index.ts`、`src/_app/layouts/Header.tsx`
- 要件: 要件 5 のすべて
- 公開 API:
  - `@/shared/lib`: `useModal(initialOpen?: boolean): { isOpen: boolean; open: () => void; close: () => void }`
  - `@/shared/ui`: `Modal(props: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string })` と `ModalTitle(props: { children: React.ReactNode; className?: string })`
    - Radix UI の `Dialog` で作る（当初は `<dialog>` で自作したが、レビュー対応の後に置き換えた）。背景クリック・Esc で閉じる、開いている間の背面スクロール禁止、フォーカスの閉じ込めは Radix が受け持つ。右上の閉じるボタン（`aria-label="閉じる"`、`X` アイコン）と内側のスクロール領域は `Modal` が描画する
    - `ModalTitle` は `Dialog.Title` を包んだ見出しで、モーダルの名前（`aria-labelledby`）になる。Radix は見出しがないと開発中に警告を出すため、中身の見出しはこれで書く。`Modal` の中でだけ使える
    - `children` は開いている間だけ描画される（Radix が閉じると外す）。開くたびにマウントし直すので、フォームの入力が初期値に戻る
    - スタイルは `.overlay`（背景）・`.root`・`.scroll`・`.close`
  - `_app/layouts` 内部: `TaskCreateForm(props: { onClose: () => void })` — 今の `TaskCreateModal.tsx` の `TaskCreateForm` を移す。見出しは `ModalTitle` で書く。スタイルは `.form` 以降を `TaskCreateForm.module.scss` に移す
- 補足: `Header` は `const taskModal = useModal()` を使い、`<Modal open={taskModal.isOpen} onClose={taskModal.close}><TaskCreateForm onClose={taskModal.close} /></Modal>` のように組み合わせる。
- コミット: `♻️ refactor: タスク追加モーダルを開閉の hooks・枠・フォームに分ける`

### 第 5 段階

#### タスク 5: 自作のプルダウンを共通部品にし、見た目を揃える（PR #2）

- 目的: 標準の `<select>` を使わないプルダウン部品 `Select` を `shared/ui` に作り、プロジェクト内の 4 か所のプルダウンをすべて置き換える。あわせて、ステータスの選択肢と「今のプロジェクトを選択肢に残す」処理を `entities/task` にまとめる。
- 担当範囲:
  - 追加: `src/shared/ui/Select/Select.tsx`、`src/shared/ui/Select/Select.module.scss`、`src/entities/task/model/status.ts`、`src/entities/task/lib/projectOptions.ts`
  - 削除: `src/_pages/tasks/ui/LimitSelect.module.scss`
  - 変更: `src/shared/ui/index.ts`、`src/entities/task/index.ts`、`src/entities/task/ui/TaskRow.tsx`、`src/entities/task/ui/TaskRow.module.scss`、`src/_pages/task-detail/ui/TaskDetailForm.tsx`、`src/_pages/task-detail/ui/TaskDetailForm.module.scss`、`src/_app/layouts/TaskCreateForm.tsx`、`src/_app/layouts/TaskCreateForm.module.scss`、`src/_pages/tasks/ui/LimitSelect.tsx`
- 要件: 要件 2 のすべて
- 公開 API:
  - `@/shared/ui`:
    - `type SelectOption<T extends string | number> = { value: T; label: string }`
    - `Select<T extends string | number>(props: { options: SelectOption<T>[]; value: T | null; onChange: (value: T) => void; id?: string; "aria-label"?: string; "aria-labelledby"?: string; placeholder?: string; size?: "medium" | "small"; disabled?: boolean; invalid?: boolean; autoFocus?: boolean; className?: string })`
  - `@/entities/task`:
    - `TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[]` — 未完了・完了・アーカイブ。`shared/ui` の `SelectOption` は使わず、構造で `Select` に渡す（業務ルールのデータを UI 部品の型に依存させないため）
    - `toProjectOptions(projects: Project[], current?: Project): { value: string; label: string }[]` — プロジェクトをプルダウンの選択肢にする。`current` を渡すと、`projects` に `current` がなければ先頭に足す（今の `TaskDetailForm` の `projectOptions` と同じ）
- `Select` の作り:
  - Radix UI の `Select` で作る（当初は WAI-ARIA の Select-Only Combobox に沿って自作したが、レビュー対応の後に置き換えた）。props は変えないので、使う側はそのまま使える
  - キーボード操作（上下キー・Home / End・頭文字での移動・Enter / Space で選ぶ・Esc で閉じる）、ARIA の役割と状態、一覧の外のクリックで閉じる処理は Radix が受け持つ
  - Radix は値を文字列で扱うため、`String(value)` にして渡し、選ばれたら `options` から元の値（数値も含む）に戻して `onChange` を呼ぶ。未選択（`null`）は空文字にして、プレースホルダーを表示する
  - 本体は `Select.Trigger`（`<button role="combobox">`）で、`id`・`aria-label`・`aria-labelledby`・`aria-invalid`・`autoFocus` を渡す。一覧（`Select.Content`）にも `aria-label`・`aria-labelledby` を渡す
  - 一覧は `position="popper"`・`sideOffset={4}` で本体の下に出す。`Select.Portal` で body の直下に描画されるので、表のセルやモーダルの `overflow` に隠れない。下に入りきらなければ Radix が上に開く。幅は `--radix-select-trigger-width` 以上、高さは `min(240px, --radix-select-content-available-height)`
  - 状態は Radix の data 属性で当てる: プレースホルダーは `[data-placeholder]`、選択中の項目は `[data-state="checked"]`、マウスを乗せた項目とキーボードで移動中の項目は `[data-highlighted]`
  - 見た目は「標準」（`size="medium"`）をタスク追加モーダルの今のプルダウンに合わせる（枠線 1px `var(--color-border)`、角丸 8px、影 `var(--shadow-card)`、背景 `var(--color-surface)`、余白 12px・右に矢印分 40px、文字 13px、矢印 20px）。「小」（`size="small"`）は今の表のプルダウンの大きさに合わせる（余白 4px 6px・右に矢印分、文字 12px、矢印 14px）
  - 状態: プレースホルダーは `var(--color-text-muted)`、`disabled` は薄く（不透明度を下げる）してクリックで開かない、`invalid` は枠線 `var(--color-danger)`、フォーカス中は `:focus-visible` で枠線を `var(--color-primary)` にする（エラー中もフォーカスが分かるよう、`invalid` より優先する）
  - 一覧の項目: 選択中は文字色 `var(--color-primary)`、マウスを乗せた項目とキーボードで移動中の項目は背景 `var(--color-primary-bg)`
- 置き換え:
  - `TaskRow`: プロジェクト（`toProjectOptions(projects, task.project)`）とステータス（`TASK_STATUS_OPTIONS`）を `<Select size="small" aria-label=…>` に。保存中は `disabled`。`.select` は今の幅を保つ `max-width: 160px` だけを残し、`className` に渡す
  - `TaskDetailForm`: プロジェクト・ステータスを `<Select id="task-project" aria-labelledby="task-project-label" …>` / `<Select id="task-status" aria-labelledby="task-status-label" …>` にし、`<label>` に同じ id を付ける。`projectOptions` を `toProjectOptions` に、`STATUS_OPTIONS` を `TASK_STATUS_OPTIONS` に置き換える。`.selectWrap`・`.select`・`.arrow` と `ChevronDown` の import を消す
  - `TaskCreateForm`: プロジェクトを `<Select id="task-project" aria-labelledby="task-project-label" placeholder="プロジェクトを選択してください" invalid={!!errors.project} autoFocus …>`（選択肢は `toProjectOptions(projects)`、`value` は未選択なら `null`）、ステータスを `TASK_STATUS_OPTIONS` の `<Select id="task-status" aria-labelledby="task-status-label" …>` に。`<label>` に同じ id を付ける。`STATUSES` と `.selectWrap`・`.select`・`._empty`・`.chevron` を消す
  - `LimitSelect`: props に `labelId` を足し、中身を `<Select size="small" id={id} aria-labelledby={labelId} options={LIMITS から作る} …>` にする（選択肢の文言は「20 件」などのまま）。`LimitSelect.module.scss` は不要になるので消す。`TasksContent` のラベルに `id="tasks-limit-label"` を付け、`.limit` に `white-space: nowrap` を足す
- コミット: `✨ feat: 自作のプルダウンを共通部品にし、プロジェクト全体で見た目を揃える`

## 判断した点

- **1 段階 1 タスク:** `/plan` の通常の分け方（レイヤーごとに並列）ではなく、仕様書の「進め方とコミット」に合わせてレビューコメントごとに 5 段階に分けた。並列実装はしない。
- **日付の関数名:** 移すだけの `toDateString`・`toDisplay`・`formatRemaining`・`today` は今の名前のまま。`dayjs` の整形は `formatDate(value, format)` 1 つにまとめ、書式を引数で渡す。`parseInput` は `shared` に出すと何の入力か分からないため、`parseSlashDate` に名前を変える。
- **モーダルの組み立て:** `TaskCreateModal` は残さず、`Header` で `useModal`・`Modal`・`TaskCreateForm` を組み合わせる。3 つに分けた形がそのまま読めるようにするため。
- **hooks の名前:** 開閉状態の hooks は、何に使うものか分かりやすい `useModal` にした。中身はモーダル専用ではない（`isOpen`・`open`・`close` を持つだけ）。
- **Radix UI に置き換えた:** 自作の `Select`・`Modal` は、レビュー対応の後に Radix UI（`radix-ui` パッケージ）の `Select`・`Dialog` に置き換えた。キーボード操作・読み上げ・開く位置・フォーカスの管理など、ブラウザやスクリーンリーダーごとの違いを自作で確かめ続けるより、検証済みのライブラリに任せる方が品質を保ちやすいため。props（公開 API）はほぼ変えず、使う側の変更は `Modal` の見出し（`ModalTitle`）だけにした。
- **ラベルのクリック:** 本体は `<button>` なので `<label htmlFor>` と結び付き、ラベルをクリックすると一覧が開く。仕様書の「ラベルをクリックするとプルダウンにフォーカスが移る」は満たすが、標準の `<select>` とは動きが少し違う。
- **`autoFocus` の扱い:** `Select` の `autoFocus` は本体の `<button>` に渡す。使う側（`TaskCreateForm`）では今と同じく、`jsx-a11y/no-autofocus` の `eslint-disable-next-line` と理由のコメントを残す。
- **「小」の大きさ:** 今の表のプルダウン（余白 4px 6px、文字 12px）を基準にした。表示件数（`LimitSelect`）は今は枠線なしだが、「小」に揃えるので枠線・角丸・影が付く。
- **`LimitSelect` は残す:** `/tasks` の中だけで使う、表示件数の選択肢（`LIMITS`）を持った部品として残し、中身だけ `Select` にする。
- **`_app/layouts` への追加:** `TaskCreateForm` は `useProjects()` を使うタスク追加専用のフォームなので、`Header` と同じ `_app/layouts` に置く（`index.ts` からは export しない）。
- **上に開いたときの重なり:** 下に入りきらないときに上に開くと、一覧がすぐ上の入力欄やラベルに重なる（例: タスク追加モーダルのステータスが締切日の欄に重なる）。標準の `<select>` も同じように上に開いて重なるため、これでよいとした。モーダルのスクロール領域を動かして下に開く方法もあるが、開くたびに画面が動き、どこを操作しているか分かりにくくなるため採らない。
- **頭文字での移動は半角の英数字だけ:** 本体が `<button>` なので日本語入力（IME）が使えず（Radix でも同じ）、「プログラミング」のような日本語の項目は頭文字では選べない。標準の `<select>` でも日本語入力では選べないため、これでよいとした。読み仮名を持たせて検索する方法は、選択肢のデータに読み仮名がないため採らない。表示件数（「1」で「100 件」）のような英数字の項目では効く。
