# カードとページ送りの共通化 実装プラン

- 仕様書: [\_specs/unify-card-pagination.md](../_specs/unify-card-pagination.md)
- ブランチ: `feature/unify-card-pagination`

## 方針

まとめた 4 つを、使う場所に合わせて次のレイヤーに置く。

| まとめるもの         | 置き場所                               | 使う場所                                                    |
| -------------------- | -------------------------------------- | ----------------------------------------------------------- |
| プロジェクトのカード | `entities/project/ui/ProjectCard`      | `_pages/home`・`_pages/projects`                            |
| プロジェクト色の指定 | `entities/project/lib/projectColor.ts` | `entities/project`・`_app/layouts`・`_pages/project-detail` |
| ページ送り           | `shared/ui/Pagination`                 | `_pages/projects`・`_pages/tasks`                           |
| ページ番号の読み取り | `shared/lib/page.ts`（`parsePage`）    | `_pages/projects`・`_pages/tasks`                           |

- カードは `Project` を表示する業務の部品で、2 つのページで使うため `entities/project` に置く。今の `_pages/projects/ui/ProjectCard`（JSX と SCSS）をそのまま移し、`_pages/home/ui/RecentProject` は消す。
- プロジェクト色の指定は「プロジェクトの色を `--project-color` に入れる」というプロジェクト固有の取り決めのため、`shared` ではなく `entities/project` に置く。カードと同じスライスなので、カードからはスライスの中で import する。`_app` と `_pages` は `entities` を import できる。
- ページ送りは業務に依存しないため `shared/ui` に置く。今の `_pages/tasks/ui/Pagination`（`…` の省略と見た目）を元にし、ボタンを `next/link` のリンクに変える。移り先の URL はページごとに違うので、ページ番号から href を作る関数を props で受け取る。
- `parsePage` は今の `_pages/tasks/lib/params.ts` から `shared/lib` に移す。`parseLimit`・`buildHref` は `/tasks` だけで使うので `_pages/tasks` に残す。

第 1 段階で `shared`・`entities` を作り、第 2 段階で使う側をスライスごとに並列で書き換える。サイドバー（`_app/layouts`）とプロジェクト詳細（`_pages/project-detail`）は、どちらも 1 行を置き換えるだけなので 1 つのタスクにまとめる。

## タスク

### 第 1 段階

#### タスク 1: ページ送りとページ番号の読み取りを shared に作る

- 目的: `/projects` と `/tasks` で使う、リンクのページ送りと `parsePage` を `shared` に用意する。
- 担当範囲:
  - `src/shared/ui/Pagination/Pagination.tsx`（新規。`src/_pages/tasks/ui/Pagination.tsx` を元にする）
  - `src/shared/ui/Pagination/Pagination.module.scss`（新規。`src/_pages/tasks/ui/Pagination.module.scss` を元にする）
  - `src/shared/ui/index.ts`（`Pagination` を export に追加）
  - `src/shared/lib/page.ts`（新規。`parsePage` を `src/_pages/tasks/lib/params.ts` から写す）
  - `src/shared/lib/index.ts`（`parsePage` を export に追加）
- 要件（「ページ送り」「ページ番号の読み取り」のうちコンポーネント・関数側の部分）:
  - 見た目は今の `/tasks` のページ送りのまま（「<」「>」は `lucide-react` の `ChevronLeft`・`ChevronRight`、`size={16}`、項目の間隔 16px、右寄せ、ホバー時の背景なし）。
  - `…` の省略は今の `getItems()` と同じ（7 ページ以下なら全ページ、それより多ければ先頭・末尾・今のページとその前後 1 つ）。`…` は `aria-hidden` の `span`。
  - ページ番号と「<」「>」は `next/link` の `Link` にし、href は `getHref(ページ番号)` で作る。「<」「>」の `aria-label` は「前のページ」「次のページ」。
  - 今のページの番号に `aria-current="page"` を付け、`--color-primary` の太字にする（`._current`）。今のページの番号もリンクのままにする。
  - 1 ページ目の「<」と最終ページの「>」はリンクにせず、`span` で今の `:disabled` と同じ薄い色（`--color-text-muted`・`opacity: 0.5`）で表示する（`._disabled`）。押せない要素なので `aria-hidden="true"` を付ける。
  - `totalPages` が 1 以下のときは何も表示しない（`null` を返す）。
  - `<nav aria-label="ページ送り">` で包み、`className` を `clsx(s.root, className)` で結合する。
  - `parsePage` の動作は今と同じ（数字以外・0 以下・空・`null` は 1。上限は見ない）。
- コミット: `♻️ refactor: ページ送りとページ番号の読み取りを shared に移す`
- 公開 API:

  ```ts
  // @/shared/ui
  export function Pagination(props: {
    page: number;
    totalPages: number;
    // ページ番号から移り先の URL を作る
    getHref: (page: number) => string;
    className?: string;
  }): React.ReactElement | null;

  // @/shared/lib
  export function parsePage(value: string | null): number;
  ```

#### タスク 2: プロジェクトのカードとプロジェクト色の指定を entities/project に作る

- 目的: ダッシュボードと `/projects` で使うカードと、`--project-color` を渡す書き方を `entities/project` にまとめる。
- 担当範囲:
  - `src/entities/project/lib/projectColor.ts`（新規）
  - `src/entities/project/ui/ProjectCard.tsx`（新規。`src/_pages/projects/ui/ProjectCard.tsx` を移す）
  - `src/entities/project/ui/ProjectCard.module.scss`（新規。`src/_pages/projects/ui/ProjectCard.module.scss` を移す）
  - `src/entities/project/index.ts`（`ProjectCard`・`projectColorStyle` を export に追加）
- 要件:
  - 「プロジェクトのカード」のうちコンポーネント側の部分: 表示する内容・リンク・見た目は今の `_pages/projects/ui/ProjectCard` と同じにする（JSX・クラス名・アイコンの大きさ・SCSS を変えない）。ルートは今と同じく `<li>`。
  - 「プロジェクト色の指定」: `projectColorStyle(project.color)` は `{ "--project-color": color }` を `React.CSSProperties` として返す。型の変換（`as React.CSSProperties`）はこの関数の中だけで行う。カードの `Link` の `style` はこれを使う。
- コミット: `♻️ refactor: プロジェクトのカードとプロジェクト色の指定を entities に移す`
- 公開 API（`@/entities/project`）:

  ```ts
  export function ProjectCard(props: {
    project: Project;
    className?: string;
  }): React.ReactElement;

  // 要素の style に渡し、CSS の var(--project-color) でプロジェクト色を使えるようにする
  export function projectColorStyle(color: string): React.CSSProperties;
  ```

### 第 2 段階

#### タスク 3: ダッシュボードのカードを共通のカードにする

- 目的: 「最近のプロジェクト」を `entities/project` の `ProjectCard` で表示する。
- 担当範囲:
  - `src/_pages/home/ui/RecentProjects.tsx`
  - `src/_pages/home/ui/RecentProject.tsx`（削除）
  - `src/_pages/home/ui/RecentProject.module.scss`（削除）
- 要件（「プロジェクトのカード」）:
  - `RecentProject` を `ProjectCard` に置き換える。先頭 3 件（`projects.slice(0, 3)`）はそのまま。
  - カードの並びの間隔（`RecentProjects.module.scss` の `.list` の `gap: 32px`）は変えない。
  - 見た目が仕様書のとおり `ProjectCard` のものに変わることを確かめる。
- コミット: `♻️ refactor: ダッシュボードのプロジェクトのカードを共通のカードにする`
- 使う公開 API: `ProjectCard`（`@/entities/project`）

#### タスク 4: /projects のカード・ページ送り・ページ番号の読み取りを共通のものにする

- 目的: `/projects` の一覧を共通のカード・ページ送り・`parsePage` で表示する。
- 担当範囲:
  - `src/_pages/projects/ui/ProjectList.tsx`
  - `src/_pages/projects/ui/ProjectCard.tsx`・`ProjectCard.module.scss`（削除）
  - `src/_pages/projects/ui/Pagination.tsx`・`Pagination.module.scss`（削除）
- 要件:
  - 「プロジェクトのカード」: `ProjectCard` を `@/entities/project` から import する。1 ページ 10 件（`PAGE_SIZE`）はそのまま。
  - 「ページ番号の読み取り」: `page` は `parsePage(searchParams.get("page"))` で読み、全ページ数を超えるときは 1 にする（URL は書き換えない）。
  - 「ページ送り」: `Pagination` を `@/shared/ui` から使う。href は 1 ページ目なら `/projects`、それ以外は `/projects?page=<n>` にする（`usePathname()` を使う）。`className={s.pagination}` はそのまま渡す。
  - `{page} / {totalPages} ({件数} 件)` の表示、読み込み中・失敗・0 件の表示は変えない。
- コミット: `♻️ refactor: プロジェクト一覧のカードとページ送りを共通のものにする`
- 使う公開 API: `ProjectCard`（`@/entities/project`）、`Pagination`（`@/shared/ui`）、`parsePage`（`@/shared/lib`）

#### タスク 5: /tasks のページ送りを共通のものにする

- 目的: `/tasks` を共通のページ送り（リンク）と `shared` の `parsePage` で表示する。
- 担当範囲:
  - `src/_pages/tasks/ui/TasksContent.tsx`
  - `src/_pages/tasks/lib/params.ts`（`parsePage` を削除）
  - `src/_pages/tasks/ui/Pagination.tsx`・`Pagination.module.scss`（削除）
- 要件（「ページ送り」「ページ番号の読み取り」）:
  - `Pagination` を `@/shared/ui` から使い、`onSelect` の代わりに `getHref={(next) => buildHref(pathname, next, limit)}` を渡す。`page={Math.min(page, totalPages)}` と `className={s.pagination}` はそのまま。
  - `parsePage` は `@/shared/lib` から import する。
  - 表示件数の切り替え（`LimitSelect` と `router.push`）、範囲外のページを 1 ページ目に戻す `router.replace`、件数の表示は変えない。
  - ページ送りを出す条件（`totalPages !== null && totalPages > 1`）は残してよい（`Pagination` も 1 ページ以下では何も出さない）。
- コミット: `♻️ refactor: タスク一覧のページ送りを共通のものにする`
- 使う公開 API: `Pagination`（`@/shared/ui`）、`parsePage`（`@/shared/lib`）

#### タスク 6: サイドバーとプロジェクト詳細のプロジェクト色の指定を共通のものにする

- 目的: 残る 2 か所の `--project-color` の書き方を `projectColorStyle` に置き換える。
- 担当範囲:
  - `src/_app/layouts/SidebarProject.tsx`
  - `src/_pages/project-detail/ui/ProjectDetailCard.tsx`
- 要件（「プロジェクト色の指定」）:
  - `style={{ "--project-color": project.color } as React.CSSProperties}` を `style={projectColorStyle(project.color)}` に置き換える。それ以外は変えず、見た目も変わらないこと。
  - 置き換えたあと、`src/` に `"--project-color"` の書き方が `projectColor.ts` 以外に残っていないことを確かめる。
- コミット: `♻️ refactor: サイドバーとプロジェクト詳細のプロジェクト色の指定を共通のものにする`
- 使う公開 API: `projectColorStyle`（`@/entities/project`）

## 判断した点

- カードは `entities/project/ui` に置いた。`Project` を表示する業務の部品で、`_pages/home` と `_pages/projects` の 2 か所で使い、`_pages` のスライス同士は import できないため。業務に依存するので `shared/ui` にはしない。
- プロジェクト色の指定は、`project.color` ではなく色の文字列を受け取る関数 `projectColorStyle(color)` にした。CSS 変数の名前（`--project-color`）がプロジェクト固有なので `entities/project` に置いた。コンポーネントで包む形にしなかったのは、`Link`・`span`・`section` と付ける要素がばらばらなため。
- ページ送りは、ページ番号から href を作る関数（`getHref`）を props で受け取る形にした。`/projects` は `page` だけ、`/tasks` は `limit` も保つため、URL の作り方はページ側に残す。
- `/projects` の 1 ページ目の href は `?page=1` ではなく `/projects` にした。`/tasks` と同じく、初期値はクエリに含めないように揃えた。
- 1 ページしかないときにページ送りを出さない判定は `Pagination` の中に入れた。どのページで使っても同じ動きになるため。
- 端のページで押せない「<」「>」は `span` にし、`aria-hidden="true"` を付けた。リンクにしない要件のため、`disabled` を付けられるボタンは使わない。押せない要素を読み上げで「リンク」と誤解させないため、読み上げの対象から外す。
- 今のページの番号もリンクのままにした。今の `/projects` のページ送りと同じ。
- ダッシュボードのカードの並びの間隔（32px）と `/projects` の間隔（16px）は、それぞれのページの一覧の指定なので揃えない（仕様書でカードの見た目だけを揃えると決めているため）。
- `parseLimit`・`buildHref` は `/tasks` だけで使うので `_pages/tasks/lib/params.ts` に残した。
- サイドバー（`_app`）とプロジェクト詳細（`_pages/project-detail`）は、レイヤーが違うが、どちらも 1 行の置き換えなので 1 タスクにまとめた。
