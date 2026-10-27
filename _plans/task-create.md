# タスク作成 実装プラン

- 仕様書: [\_specs/task-create.md](../_specs/task-create.md)
- ブランチ: `feature/task-create`

## 方針

作成の流れは次のとおり。

1. `shared/api/task.ts` に作成の関数 `createTask()` を足す。`getTasks` などと同じく API を呼ぶだけなので `shared/api` に置く。
2. 「タスクが変わったこと」をヘッダーからページへ伝える Context を、`entities/task` に新しく作る（`TaskChangesProvider`）。ヘッダーは `_app/layouts`、一覧は `_pages/home`・`_pages/tasks` にあり、どちらからも import できるのは下のレイヤーだけのため。タスクという業務の概念の状態なので `shared` ではなく `entities/task` に置く。中身は数値の `revision` と、それを 1 増やす `notifyTasksChanged()` だけにする。`RootLayout` で `ProjectsProvider` の内側に置き、アプリ全体を包む。
3. 一覧の 2 か所は `revision` が変わったら取り直す。ダッシュボードは `useFetch` を使っているので、`useFetch` に「この値が変わったら取り直す」`key` を足す。`/tasks` の `TasksContent` は独自の `useEffect`（取り消し付き）のため、依存配列に `revision` を足すだけにする。
4. 送信は `TaskCreateForm` が行う。送信中にモーダルを閉じるとフォームはアンマウントされる（`Modal` は閉じると中身を外す）ため、結果の知らせ方をフォームがマウントされているかどうかで変える。
   - 成功: マウント中なら `onClose()` で閉じる。どちらの場合も `onCreated()` を呼ぶ。
   - 失敗: マウント中ならフォームにエラーを出す。アンマウント後なら `onCreateFailed()` を呼ぶ。
5. `Header` は `onCreated()` で `notifyTasksChanged()` と成功のトースト、`onCreateFailed()` で失敗のトーストを出す。トーストの部品 `Toast` は、今はヘッダーでしか使わないので `_app/layouts` に置く（使う箇所が増えたら `shared/ui` に移す）。

`useFetch` の `key` は、前回の `fetch-hooks` で「必要になったら足す」とした機能。ただし、`key` が変わっても読み込み中には戻さず、取り直しが終わるまで前の結果を表示したままにする（仕様書の「その場で取り直す」に合わせ、一覧が一瞬「読み込み中…」に変わらないようにするため）。前回外した理由だった「前の結果を捨てる処理」は要らないので、追加は小さく済む。

## タスク

### 第 1 段階

#### タスク 1: 作成の API 関数と、useFetch の取り直し

- 目的: タスクを作成する関数と、値が変わったときに取り直せる `useFetch` を用意する。
- 担当範囲:
  - `src/shared/api/task.ts`（`createTask`・`CreateTaskBody` を追加）
  - `src/shared/api/index.ts`（export に追加。`merge=union` のため、既存の行は書き換えず、行を足す形にする）
  - `src/shared/lib/useFetch.ts`（`options.key` を追加）
- 要件:
  - 「すべて入力して『作成』を押すと、`POST /api/v1/users/tasks` にタスクを作成する」の API 側。`createTask(body)` は `POST /api/v1/users/tasks` に `body` をそのまま送る。レスポンスは `{ data: null }` なので何も返さない（`Promise<void>`）。失敗（400 など）は axios の例外のまま投げる。
  - 「その場で取り直す」の hooks 側。
    - `options.key` が前回と変わったら、`fetcher` を呼び直す。初回の取得は今と同じ。
    - 取り直しのあいだは前の結果（`data`・`error`）をそのまま返し、`isLoading` は `true` にしない。`isLoading` が `true` なのは、まだ 1 度も結果がないときだけ。
    - 取り直しが終わったら、成功・失敗どちらも新しい結果で置き換える。
    - `key` が続けて変わったときは、最後の `key` の結果だけを使う（古い取得の結果は捨てる。`useEffect` のクリーンアップで取り消す）。
    - `key` を渡さない今の 5 か所の動作は変えない。
- コミット: `✨ feat: タスク作成の API 関数と、useFetch の取り直しを追加`
- 公開 API:

  ```ts
  // @/shared/api
  export type CreateTaskBody = {
    projectId: string;
    title: string;
    description: string;
    deadline: string; // YYYY-MM-DD
    status: TaskStatus;
    kind: TaskKind;
  };
  export function createTask(body: CreateTaskBody): Promise<void>;

  // @/shared/lib
  export function useFetch<T>(
    fetcher: () => Promise<T>,
    options?: {
      errorMessage?: string;
      // この値が変わったら取り直す（前の結果を表示したまま）
      key?: string | number;
    },
  ): {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    setData: (update: (prev: T) => T) => void;
  };
  ```

#### タスク 2: タスクの変更を知らせる Context

- 目的: ヘッダーでタスクを作成したことを、一覧のあるページへ伝える。
- 担当範囲:
  - `src/entities/task/model/TaskChangesContext.tsx`（新規。`"use client"`）
  - `src/entities/task/model/useTaskChanges.ts`（新規）
  - `src/entities/task/index.ts`（export に追加）
- 要件:
  - 「その場で取り直す」の仕組み。
    - `TaskChangesProvider` は `revision`（初期値 0）を state に持ち、`notifyTasksChanged()` で 1 増やす。
    - `useTaskChanges()` は `{ revision, notifyTasksChanged }` を返す。`entities/project` の `ProjectsContext.tsx`・`useProjects.ts` と同じ分け方・書き方にする。
- コミット: `✨ feat: タスクの変更を知らせる TaskChangesProvider を追加`
- 公開 API（`@/entities/task`）:

  ```ts
  export function TaskChangesProvider(props: {
    children: React.ReactNode;
  }): React.JSX.Element;
  export function useTaskChanges(): {
    // タスクを作成するたびに 1 増える
    revision: number;
    notifyTasksChanged: () => void;
  };
  ```

### 第 2 段階

#### タスク 3: タスク追加モーダルから作成し、結果をトーストで知らせる

- 目的: モーダルの「作成」で API にタスクを作成し、成功・失敗を知らせる。
- 担当範囲:
  - `src/_app/layouts/RootLayout.tsx`（`ProjectsProvider` の内側を `TaskChangesProvider` で包む）
  - `src/_app/layouts/Header.tsx`
  - `src/_app/layouts/TaskCreateForm.tsx`・`TaskCreateForm.module.scss`
  - `src/_app/layouts/Toast.tsx`・`Toast.module.scss`（新規）
  - `CLAUDE.md`（「アーキテクチャ」の状態管理の段落に、`entities/task` の `TaskChangesProvider` でタスクの作成を一覧に知らせていることを足す。「共有するのはプロジェクト一覧だけ」の書き方も合わせて直す）
- 要件:
  - 「モーダルの項目・入力チェック・閉じ方は今のまま変えない」
  - 「すべて入力して『作成』を押すと…作成する」と「送る項目」: 入力チェックを通ったら `createTask({ projectId, title: title.trim(), description, deadline, status, kind: "task" })` を呼ぶ。
  - 「送信中」のすべて
    - `isSubmitting` の state を持つ。送信中は「作成」ボタンを `disabled` にして文言を「作成中…」にし、`handleSubmit` の先頭でも送信中なら何もしない。
    - プロジェクト・ステータスの `Select` に `disabled`、タスク・説明・メモ・締切日の入力に `disabled` を付ける。
    - 「キャンセル」は無効にしない。閉じるボタン・Esc・オーバーレイは `Modal` のまま閉じられる。
    - 無効の見た目は、`Select` の `&:disabled`（`opacity: 0.6`、`cursor: not-allowed`）に合わせて、`.control` と「作成」ボタンにも付ける。
  - 「作成に成功したら」のすべて
    - フォームがマウント中なら `onClose()` を呼ぶ（送信中に閉じて開き直した、新しいモーダルは閉じない）。そのあと、マウント中かどうかに関わらず `onCreated()` を呼ぶ。
    - `Header` の `onCreated` で、`useTaskChanges()` の `notifyTasksChanged()` を呼び、「タスクを作成しました」のトースト（`role="status"`）を出す。
  - 「作成に失敗したら」のすべて
    - フォームがマウント中なら、`isSubmitting` を戻して「作成に失敗しました」を `role="alert"` で表示する。文言の位置と見た目は `TaskDetailForm` に合わせ、ボタンの上に既存の `.error` と同じ色で出す。次に「作成」を押したら、送信の前にエラー表示を消す。
    - アンマウント後なら `onCreateFailed()` を呼ぶ。`Header` はそこで「タスクの作成に失敗しました」のトースト（`role="alert"`）を出す。
    - マウント中かどうかは、`useEffect` のクリーンアップで `false` にする ref で判定する。
  - トースト（`Toast`）
    - 画面の右下に固定で表示する（`position: fixed`）。白地（`--color-surface`）・`--shadow-modal`・角丸で、文字は `--color-text`。失敗のときは文字色を `--color-danger` にする。
    - 5 秒後に `onDismiss()` を呼んで消える。同じ表示中に次のトーストが出たら、新しいもので置き換え、5 秒を数え直す（`Header` でトーストに連番の `id` を持たせ、`key` に使う）。
    - `Header` はトーストを 1 件だけ state に持つ（`{ id, message, tone: "success" | "error" } | null`）。
  - 「デスクトップ表示で崩れない」
- コミット: `✨ feat: タスク追加モーダルからタスクを作成する`
- 使う公開 API:
  - `createTask`・`CreateTaskBody`（`@/shared/api`）
  - `TaskChangesProvider`・`useTaskChanges`（`@/entities/task`）
- 作る部品（`_app/layouts` の中だけで使う。`index.ts` からは export しない）:

  ```ts
  // Toast.tsx
  export function Toast(props: {
    message: string;
    tone: "success" | "error"; // success は role="status"、error は role="alert"
    onDismiss: () => void; // 5 秒後に呼ぶ
    className?: string;
  }): React.JSX.Element;

  // TaskCreateForm.tsx（Props を変更）
  type Props = {
    onClose: () => void;
    // 作成に成功したとき（送信中にモーダルを閉じていても呼ぶ）
    onCreated: () => void;
    // 送信中にモーダルを閉じ、そのあと作成に失敗したとき
    onCreateFailed: () => void;
  };
  ```

#### タスク 4: タスクの作成後に、一覧をその場で取り直す

- 目的: ダッシュボードと `/tasks` のタスク一覧を、作成後に開き直さずに更新する。
- 担当範囲:
  - `src/_pages/home/ui/DashboardTasks.tsx`
  - `src/_pages/tasks/ui/TasksContent.tsx`
- 要件:
  - 「いま開いているページのタスク一覧を、その場で取り直す」
    - `DashboardTasks` は `useTaskChanges()` の `revision` を `useFetch(..., { key: revision })` に渡す。取り直しのあいだは今の一覧を表示したまま。「あと n ページ」も取り直した `pageInfo` で更新される。
    - `TasksContent` は `revision` を `useEffect` の依存配列に足す。今のページ番号・表示件数のまま取り直す。取り直しのあいだは `result.key` が今の URL と同じため、今の一覧を表示したままになる。範囲外のページの扱い・件数（`counts`）の更新は今のまま。
  - `Summary`（統計）は取り直さない（仕様書の「対象外」）。
- コミット: `✨ feat: タスクの作成後にタスク一覧を取り直す`
- 使う公開 API:
  - `useTaskChanges`（`@/entities/task`）
  - `useFetch` の `key`（`@/shared/lib`）

## 判断した点

- 一覧の取り直しは、`entities/task` の Context（`revision` を増やす）で伝える。ヘッダー（`_app`）からページ（`_pages`）へ直接は伝えられず、状態管理は React Context に揃えているため。`window` のイベントなどは使わない。
- Context は「作成した」ではなく「タスクが変わった」（`notifyTasksChanged`）という名前にした。今は作成でしか呼ばないが、ほかの変更で取り直したくなったときにも同じ名前で使えるため。今回は作成以外では呼ばない。
- `useFetch` の `key` で取り直すとき、読み込み中の表示には戻さず、前の結果を表示したままにする。取り直しに失敗したら、エラー表示（「読み込みに失敗しました」）に置き換える（前の一覧を残すと、古い一覧であることがわからないため）。
- 送信は `Header` ではなくフォームに持たせた。入力内容・送信中・フォームのエラーはフォームの state で、閉じたあとの知らせ方だけを `Header` に任せれば済むため。マウント中かどうかの判定に ref を使う。
- 送信中に閉じてモーダルを開き直したあとに前の作成が成功しても、新しく開いたモーダルは閉じない（成功時に閉じるのは、送ったフォームがまだ開いているときだけ）。失敗のトーストもそのまま出す。ただし、開き直したモーダルの表示中はモーダルの外側が操作できない（Radix の Dialog）ため、トーストは見えるが読み上げられない場合がある。まれな操作のため、対応しない。
- 失敗のトースト（送信中に閉じていた場合）も、成功と同じく 5 秒で消す。閉じるボタンなどは付けない。
- トーストは `_app/layouts` に置いた。今はヘッダーでしか使わないため。同時に表示するのは 1 件だけで、新しいものが来たら置き換える。
- トーストの色は新しい CSS 変数を足さず、既存の `--color-surface`・`--shadow-modal`・`--color-text`・`--color-danger` を使う。
- 送信中の無効の見た目は、既存の `Select` の `&:disabled` に合わせた。
- `deadline` は日付入力の `YYYY-MM-DD` のまま送る（仕様書の「使う API・データ」のとおり、一覧の並べ替え・表示は動く）。`description` は空でもそのまま送る。
- `DashboardTasks` と `TasksContent` は別のスライスだが、どちらも数行の同じ目的の変更なので 1 タスクにまとめた。
- `CLAUDE.md` の「アーキテクチャ」は、共有する状態が増えるため、タスク 3 で更新する。
