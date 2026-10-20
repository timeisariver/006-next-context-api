# ディレクトリ構成（Feature-Sliced Design）

このアプリは [Feature-Sliced Design (FSD)](https://feature-sliced.design/) を採用している。ただし小規模なため、レイヤーは `_app`・`_pages`・`entities`・`shared` の 4 つだけを使う（`widgets`・`features` は使わない）。

コードの置き場所の判断基準（いつ `entities`・`shared` に切り出すかなど）は、FSD 公式のエージェントスキル [`.claude/skills/feature-sliced-design/`](../.claude/skills/feature-sliced-design/SKILL.md) に従う。このドキュメントとスキルが食い違う場合は、このドキュメントを優先する。

```
app/                # Next.js のルーティング専用（src/_pages を再エクスポートするだけ）
src/
  _app/             # app レイヤー（スライスなし）
    layouts/        #   セグメント（ルートレイアウト、ヘッダー）
      index.ts      #     Public API
    styles/         #   セグメント（グローバルスタイル）
  _pages/           # pages レイヤー
    home/           #   スライス
      ui/           #     セグメント
      index.ts      #     Public API
  entities/         # entities レイヤー
    project/        #   スライス
      model/        #     セグメント（Context）
      index.ts      #     Public API
  shared/           # shared レイヤー（スライスなし）
    api/            #   セグメント（API のデータ取得と、レスポンスの型）
      index.ts      #     Public API
    ui/             #   セグメント（共通 UI 部品、SCSS パーシャル）
      index.ts      #     Public API
```

Next.js の `app/`・`pages/` と名前が衝突するため、FSD の `app`・`pages` レイヤーは `src/_app/`・`src/_pages/` としている。import は `@/*`（`src/*`）経由で行う（例: `@/_pages/home`、`@/shared/ui`）。

## レイヤー

| レイヤー   | 役割                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| `_app`     | アプリ全体の初期化。グローバルスタイル、Provider、全ページ共通のレイアウト     |
| `_pages`   | 1 ページ分の画面。そのページだけで使う UI・状態・データ取得もここに置く        |
| `entities` | 業務上の概念（プロジェクトなど）。複数ページで共有する状態、業務ルール         |
| `shared`   | 業務ロジックを持たない共通部品。UI 部品、API のデータ取得、SCSS パーシャルなど |

## スライス

スライスは、レイヤーの中を**業務ドメインごと**に分けた単位。このアプリでは `_pages` と `entities` がスライスを持つ。`_pages` は 1 ページ = 1 スライス（例: `src/_pages/home/`）、`entities` は 1 業務概念 = 1 スライス（例: `src/entities/project/`）とする。

各スライスは `index.ts` を Public API とし、外部に公開するものだけを export する。スライスの外からは `index.ts` 経由で import し、内部のファイルを直接 import しない。

```ts
// OK
import { Home } from "@/_pages/home";

// NG（スライスの内部を直接参照している）
import { Home } from "@/_pages/home/ui/HomePage";
```

## セグメント

セグメントは、スライスの中を**技術的な役割ごと**に分けた単位。

| セグメント | 置くもの                                      |
| ---------- | --------------------------------------------- |
| `ui/`      | コンポーネントと、その隣に置く`*.module.scss` |
| `model/`   | 状態、型、ビジネスロジック（Context など）    |
| `api/`     | データ取得                                    |
| `lib/`     | スライス内で使うヘルパー                      |
| `config/`  | 設定値                                        |

必要になったセグメントだけを作る。

セグメント内のファイルは、`types.ts`・`utils.ts` のような技術的な役割ではなく、ドメインで名前を付ける（例: `shared/api/project.ts` に Project の型と取得関数をまとめる）。

## データ取得と型の置き場所

API を呼んで結果を返すだけのデータ取得（業務ルールを含まないもの）と、そのレスポンスの型は、何か所から使われても `shared/api/` に置く。1 ページでしか使わないなら、そのページの `api/` セグメントに置く。`entities` の `api/` に置くのは、権限チェックや状態遷移などの業務ルールを含む場合だけにする。

## `_app` と `shared` はスライスを持たない

`_app` はアプリ全体、`shared` は業務に依存しない部品を扱うレイヤーで、業務ドメインで分ける必要がない。そのため、この 2 つはスライスを持たず、レイヤー直下に直接セグメントを置く。

```
src/_app/styles/      # ○ レイヤー直下のセグメント
src/shared/ui/        # ○ レイヤー直下のセグメント
src/shared/task/ui/   # × shared にスライスは作らない
```

スライスがないため、Public API はセグメントごとに `index.ts` を置く（例: `@/_app/layouts`、`@/shared/ui`）。ただし SCSS パーシャル（`_name.scss`）は TypeScript の `index.ts` から export できないため、`@use "name";` のように直接読み込む。

## 依存ルール

import できるのは**自分より下のレイヤーだけ**。

```
_app  →  _pages  →  entities  →  shared
（上）                            （下）
```

| import 元  | import できるもの              |
| ---------- | ------------------------------ |
| `_app`     | `_pages`・`entities`・`shared` |
| `_pages`   | `entities`・`shared`           |
| `entities` | `shared`                       |
| `shared`   | なし（外部ライブラリのみ）     |

あわせて、次のルールも守る。

- **同じレイヤーのスライス同士は import しない。** 例: `_pages/home` から `_pages/settings` を import しない。複数のページで使いたいものは、業務に依存するなら `entities`、依存しなければ `shared` に移す。
- **下のレイヤーから上のレイヤーを import しない。** 例: `shared` から `_pages` や `_app` を import しない。
- スライスを持たない `_app`・`shared` の中では、セグメント同士の import は自由にしてよい。

これらのルールと Public API 経由の import は、ESLint の `no-restricted-imports`（`eslint.config.mjs`）で検査している。違反すると `npm run lint` がエラーになる。

<img width="2720" height="1840" alt="fsd_app_pages_shared_imports" src="https://github.com/user-attachments/assets/3311e032-7f4d-4993-9cac-718ff1f64b21" />

## その他のルール

- ルートの `app/` は Next.js のルーティング専用で、ルートファイルは `src/_pages/` を再エクスポートするだけにする。
- `app/api/` は教材として配布された API のため改変しない。
- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、各スライスの `ui/` に置く。クラス名は `CLAUDE.md` の「CSS 命名規則」に従う。
- ルートの `app/layout.tsx` は `src/_app/layouts` を再エクスポートする。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`@use "name";` のように相対パスなしで読み込める。
