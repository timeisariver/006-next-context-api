# ディレクトリ構成（Feature-Sliced Design）

このアプリは [Feature-Sliced Design (FSD)](https://feature-sliced.design/) を採用している。ただし小規模なため、レイヤーは `_app`・`_pages`・`shared` の 3 つだけを使う（`widgets`・`features`・`entities` は使わない）。

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
  shared/           # shared レイヤー（スライスなし）
    ui/             #   セグメント（Button、SCSS パーシャル）
      index.ts      #     Public API
```

Next.js の `app/`・`pages/` と名前が衝突するため、FSD の `app`・`pages` レイヤーは `src/_app/`・`src/_pages/` としている。import は `@/*`（`src/*`）経由で行う（例: `@/_pages/home`、`@/shared/ui`）。

<img width="2720" height="1840" alt="fsd_app_pages_shared_imports" src="https://github.com/user-attachments/assets/3311e032-7f4d-4993-9cac-718ff1f64b21" />

## レイヤー

| レイヤー | 役割                                                                       |
| -------- | -------------------------------------------------------------------------- |
| `_app`   | アプリ全体の初期化。グローバルスタイル、Provider、全ページ共通のレイアウト |
| `_pages` | 1 ページ分の画面。そのページだけで使う UI・状態・データ取得もここに置く    |
| `shared` | 業務に依存しない共通部品。UI 部品、SCSS パーシャル、ユーティリティなど     |

## スライス

スライスは、レイヤーの中を**業務ドメインごと**に分けた単位。このアプリでは `_pages` のみがスライスを持ち、1 ページ = 1 スライスとする（例: `src/_pages/home/`）。

各スライスは `index.ts` を Public API とし、外部に公開するものだけを export する。スライスの外からは `index.ts` 経由で import し、内部のファイルを直接 import しない。

```ts
// OK
import { HomePage } from "@/_pages/home";

// NG（スライスの内部を直接参照している）
import { HomePage } from "@/_pages/home/ui/HomePage";
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

## `_app` と `shared` はスライスを持たない

`_app` はアプリ全体、`shared` は業務に依存しない部品を扱うレイヤーで、業務ドメインで分ける必要がない。そのため、この 2 つはスライスを持たず、レイヤー直下に直接セグメントを置く。

```
src/_app/styles/      # ○ レイヤー直下のセグメント
src/shared/ui/        # ○ レイヤー直下のセグメント
src/shared/task/ui/   # × shared にスライスは作らない
```

スライスがないため、Public API はセグメントごとに `index.ts` を置く（例: `@/_app/layouts`、`@/shared/ui`）。ただし SCSS パーシャル（`_breakpoints.scss` など）は TypeScript の `index.ts` から export できないため、`@use "breakpoints" as bp;` のように直接読み込む。

## 依存ルール

import できるのは**自分より下のレイヤーだけ**。

```
_app  →  _pages  →  shared
（上）               （下）
```

| import 元 | import できるもの          |
| --------- | -------------------------- |
| `_app`    | `_pages`・`shared`         |
| `_pages`  | `shared`                   |
| `shared`  | なし（外部ライブラリのみ） |

あわせて、次のルールも守る。

- **同じレイヤーのスライス同士は import しない。** 例: `_pages/home` から `_pages/settings` を import しない。複数のページで使いたいものは、業務に依存しなければ `shared` に移す。
- **下のレイヤーから上のレイヤーを import しない。** 例: `shared` から `_pages` や `_app` を import しない。
- スライスを持たない `_app`・`shared` の中では、セグメント同士の import は自由にしてよい。

## その他のルール

- ルートの `app/` は Next.js のルーティング専用で、ルートファイルは `src/_pages/` を再エクスポートするだけにする。
- `app/api/` は教材として配布された API のため改変しない。
- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、各スライスの `ui/` に置く。クラス名は [CSS 命名規則](./css-naming.md) に従う。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`@use "breakpoints" as bp;` のように相対パスなしで読み込める。
