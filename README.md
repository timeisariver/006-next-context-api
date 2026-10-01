This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## ディレクトリ構成（Feature-Sliced Design）

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

### レイヤー

| レイヤー | 役割                                                                       |
| -------- | -------------------------------------------------------------------------- |
| `_app`   | アプリ全体の初期化。グローバルスタイル、Provider、全ページ共通のレイアウト |
| `_pages` | 1 ページ分の画面。そのページだけで使う UI・状態・データ取得もここに置く    |
| `shared` | 業務に依存しない共通部品。UI 部品、SCSS パーシャル、ユーティリティなど     |

### スライス

スライスは、レイヤーの中を**業務ドメインごと**に分けた単位。このアプリでは `_pages` のみがスライスを持ち、1 ページ = 1 スライスとする（例: `src/_pages/home/`）。

各スライスは `index.ts` を Public API とし、外部に公開するものだけを export する。スライスの外からは `index.ts` 経由で import し、内部のファイルを直接 import しない。

```ts
// OK
import { HomePage } from "@/_pages/home";

// NG（スライスの内部を直接参照している）
import { HomePage } from "@/_pages/home/ui/HomePage";
```

### セグメント

セグメントは、スライスの中を**技術的な役割ごと**に分けた単位。

| セグメント | 置くもの                                      |
| ---------- | --------------------------------------------- |
| `ui/`      | コンポーネントと、その隣に置く`*.module.scss` |
| `model/`   | 状態、型、ビジネスロジック（Context など）    |
| `api/`     | データ取得                                    |
| `lib/`     | スライス内で使うヘルパー                      |
| `config/`  | 設定値                                        |

必要になったセグメントだけを作る。

### `_app` と `shared` はスライスを持たない

`_app` はアプリ全体、`shared` は業務に依存しない部品を扱うレイヤーで、業務ドメインで分ける必要がない。そのため、この 2 つはスライスを持たず、レイヤー直下に直接セグメントを置く。

```
src/_app/styles/      # ○ レイヤー直下のセグメント
src/shared/ui/        # ○ レイヤー直下のセグメント
src/shared/task/ui/   # × shared にスライスは作らない
```

スライスがないため、Public API はセグメントごとに `index.ts` を置く（例: `@/_app/layouts`、`@/shared/ui`）。ただし SCSS パーシャル（`_breakpoints.scss` など）は TypeScript の `index.ts` から export できないため、`@use "breakpoints" as bp;` のように直接読み込む。

### 依存ルール

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

### その他のルール

- ルートの `app/` は Next.js のルーティング専用で、ルートファイルは `src/_pages/` を再エクスポートするだけにする。
- `app/api/` は教材として配布された API のため改変しない。
- グローバルスタイル（リセット、テーマ用 CSS 変数）は `src/_app/styles/` に置く。
- コンポーネントのスタイルは CSS Modules（`*.module.scss`）とし、各スライスの `ui/` に置く。
- 共通の SCSS パーシャルは `src/shared/ui/` に置く。`@use "breakpoints" as bp;` のように相対パスなしで読み込める。

## CSS 命名規則（変形 BEM）

本プロジェクトでは、BEM をベースに Modifier の記法のみ変更した命名規則を採用しています。スタイルは CSS Modules（`*.module.scss`）で書き、クラス名の結合には [clsx](https://github.com/lukeed/clsx) を使います。

```scss
// Block（コンポーネントのルート要素）
.ComponentName {}

// Element（Block 内の子要素）
.ComponentName__element {}

// Modifier（状態・バリエーション）
.ComponentName._modifier {}
.ComponentName__element._modifier {}
```

### 標準 BEM との違い

|          | 標準 BEM                    | 本プロジェクト                      |
| -------- | --------------------------- | ----------------------------------- |
| Block    | `.block`                    | `.ComponentName`（PascalCase）      |
| Element  | `.block__element`           | `.ComponentName__element`           |
| Modifier | `.block__element--modifier` | `.ComponentName__element._modifier` |

Block と Element は BEM と同じ考え方です。Block 名にはコンポーネント名をそのまま使い、BEM の Block の粒度 ≒ コンポーネントの粒度と捉えます。変更点は Modifier の記法のみで、`--modifier` を Block / Element に連結する代わりに、`_modifier` という独立したクラスを Block / Element と**組み合わせて**指定します。

### CSS Modules と組み合わせる理由

CSS Modules はクラス名をファイルごとにハッシュ化するため、BEM の主目的である「名前の衝突回避」はすでに満たされています。それでも Block 名を付けるのは、次の理由からです。

- DevTools で見たとき、変換後のクラス名に元の名前が残り、どのコンポーネントの要素かすぐ分かる
- `.module.scss` を開いたとき、どのコンポーネントのスタイルかがクラス名から分かる
- 命名の迷いがなくなる（ルート要素は常にコンポーネント名）

### Modifier を `_modifier` 形式にしている理由

1. **JSX の可読性** Modifier は状態に応じて付け外しすることが多く、`styles['TabPanel__tab--active']` のようにフルネームを毎回書くと冗長になります。`styles._active` と短く書けることで、JSX の見通しがよくなります。
2. **詳細度の確保** `_modifier` は単体では使わず、必ず Block や Element と組み合わせて指定します（`.ComponentName__element._modifier`）。これにより Modifier のセレクタは Block / Element より詳細度が高くなり、意図した通りに上書きが効きます。
3. **ドット記法で参照できる** Next.js の CSS Modules はクラス名をそのまま JS のキーにします（キャメルケースへの変換はしない）。ハイフンは JS の識別子に使えないため、`styles['is-active']` のようにブラケット記法が必要になります。アンダースコアならすべてのクラスを `styles._active` のようにドット記法で参照でき、型補完も効きやすくなります。

   ```tsx
   // ハイフン区切り：ブラケット記法が必須
   styles["TabPanel__tab--active"];

   // アンダースコア区切り：ドット記法で書ける
   styles._active;
   ```

   また、エディタでダブルクリックしたときの単語選択も、アンダースコアは 1 語として選択されますが、ハイフンは区切りとして扱われるため分断されます。

### 記述例

```scss
// TabPanel.module.scss
.TabPanel {
  display: flex;
  gap: 8px;

  &__tab {
    color: gray;

    &._active {
      font-weight: bold;
      color: black;
    }

    &._disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
```

```tsx
// TabPanel.tsx
import clsx from "clsx";
import styles from "./TabPanel.module.scss";

type Props = {
  tabs: { label: string; disabled?: boolean }[];
  activeIndex: number;
  className?: string;
};

export function TabPanel({ tabs, activeIndex, className }: Props) {
  return (
    <div className={clsx(styles.TabPanel, className)}>
      {tabs.map((tab, i) => (
        <button
          key={tab.label}
          type="button"
          className={clsx(styles.TabPanel__tab, {
            [styles._active]: i === activeIndex,
            [styles._disabled]: tab.disabled,
          })}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

CSS Modules ではクラス名がハッシュ化されるため、clsx のオブジェクトのキーは `{ _active: isActive }` ではなく `{ [styles._active]: isActive }` と書きます。`"_active"` という文字列のままでは、ハッシュ化されたクラスと一致せずスタイルが当たりません。

#### バリエーションを props で受け取る場合

`size` や `variant` のような props は、値をそのまま Modifier 名に対応させます。

```scss
// Button.module.scss
.Button {
  &._small {}
  &._large {}
  &._primary {}
  &._secondary {}
}
```

```tsx
type Props = {
  size?: "small" | "large";
  variant?: "primary" | "secondary";
};

<button
  className={clsx(
    styles.Button,
    size && styles[`_${size}`],
    variant && styles[`_${variant}`],
  )}
/>
```

### ルール

#### 命名

- Block 名はコンポーネント名（＝ファイル名）と一致させ、PascalCase で記述する（`TabPanel.tsx` → `TabPanel.module.scss` → `.TabPanel`）
- 1 つの `.module.scss` に Block は 1 つだけ定義する
- Element 名・Modifier 名はハイフンを使わず camelCase で記述する（例: `.TabPanel__tabList`、`._fullWidth`）。ドット記法で参照できるようにするため
- Element のネストは 1 階層まで（`.ComponentName__a__b` は禁止）。深くなる場合はコンポーネント分割を検討する
- Modifier 名は状態やバリエーションを表す形容詞・状態名にする（例: `_active`, `_disabled`, `_large`, `_primary`）

#### SCSS

- `_modifier` は**単体でスタイルを定義しない**。必ず `&._modifier` とネストし、`.Block._modifier` または `.Block__element._modifier` の形で指定する
- 要素セレクタ（`p`, `div` など）への直接指定は避け、必ずクラスを付与する
- `:global` は使わない。グローバルなスタイルは `src/_app/styles/` に置く

#### TSX

- クラス名は必ず `styles.xxx` 経由で指定し、`className="TabPanel__tab"` のような文字列リテラルは使わない
- 複数のクラスの結合や条件付きのクラスには `clsx` を使う（`[a, b].join(" ")` やテンプレートリテラルは使わない）
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(styles.Block, className)` と結合する。外側から余白などを調整したい場合はこの `className` を使い、親のスタイルから子コンポーネントの内部のクラスを上書きしない
