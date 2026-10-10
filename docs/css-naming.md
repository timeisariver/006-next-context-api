# CSS 命名規則

本プロジェクトでは BEM を使わず、CSS Modules のスコープに任せたシンプルなクラス名を採用しています。スタイルは CSS Modules（`*.module.scss`）で書き、クラス名の結合には [clsx](https://github.com/lukeed/clsx) を使います。

| 種類       | セレクタ                 | 用途                       |
| ---------- | ------------------------ | -------------------------- |
| ルート     | `.root`                  | コンポーネントのルート要素 |
| 子要素     | `.title`, `.statCount`   | コンポーネント内の要素     |
| 状態クラス | `.link._active`          | 状態・バリエーション       |

## ルール

### 命名

- コンポーネントのルート要素のクラスは `.root` とする
- 子要素のクラスは役割を表す短い名前を camelCase で付ける（例: `.head`, `.title`, `.statCount`）。ハイフンは使わない。ドット記法で参照できるようにするため
- Block / Element のようなプレフィックス（`.ComponentName__element`）は付けない。CSS Modules がファイルごとにクラス名をハッシュ化するため、名前の衝突は起きない
- 状態クラス名は状態やバリエーションを表す形容詞・状態名にし、先頭に `_` を付ける（例: `_active`, `_disabled`, `_large`）

### SCSS

- クラスはネストせず、トップレベルにフラットに並べる
- ネストしてよいのは擬似クラス・擬似要素（`&:hover`, `&::before`）、状態クラス（`&._active`）、メディアクエリ（`@include bp.md`）のみ
- 状態クラスは**単体でスタイルを定義しない**。必ず `&._active` とネストし、`.link._active` の形で指定する
- `:global` は使わない。グローバルなスタイルは `src/_app/styles/` に置く

### TSX

- クラス名は必ず `s.xxx` 経由で指定し、文字列リテラルは使わない
- 複数のクラスの結合や条件付きのクラスには `clsx` を使う（`[a, b].join(" ")` やテンプレートリテラルは使わない）
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(s.root, className)` と結合する。外側から余白などを調整したい場合はこの `className` を使い、親のスタイルから子コンポーネントの内部のクラスを上書きしない

## 記述例

```scss
// TabPanel.module.scss
.root {
  display: flex;
  gap: 8px;
}

.tab {
  color: gray;

  &:hover {
    color: black;
  }

  &._active {
    font-weight: bold;
    color: black;
  }

  &._disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
```

```tsx
// TabPanel.tsx
import clsx from "clsx";
import s from "./TabPanel.module.scss";

type Props = {
  tabs: { label: string; disabled?: boolean }[];
  activeIndex: number;
  className?: string;
};

export function TabPanel({ tabs, activeIndex, className }: Props) {
  return (
    <div className={clsx(s.root, className)}>
      {tabs.map((tab, i) => (
        <button
          key={tab.label}
          type="button"
          className={clsx(s.tab, {
            [s._active]: i === activeIndex,
            [s._disabled]: tab.disabled,
          })}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

CSS Modules ではクラス名がハッシュ化されるため、clsx のオブジェクトのキーは `{ _active: isActive }` ではなく `{ [s._active]: isActive }` と書きます。`"_active"` という文字列のままでは、ハッシュ化されたクラスと一致せずスタイルが当たりません。

### バリエーションを props で受け取る場合

`size` や `variant` のような props は、値をそのまま状態クラス名に対応させます。

```scss
// Button.module.scss
.root {
  &._small {
    padding: 4px 8px;
  }

  &._large {
    padding: 12px 24px;
  }
}
```

```tsx
type Props = {
  size?: "small" | "large";
};

<button className={clsx(s.root, size && s[`_${size}`])} />;
```

## 背景

### BEM を使わない理由

CSS Modules はクラス名をファイルごとにハッシュ化するため、BEM の主目的である「名前の衝突回避」はすでに満たされています。`.RecentProjects__itemStatCount` のような長い名前は JSX を冗長にするだけなので、`.statCount` のように短く書きます。どのコンポーネントのスタイルかは、ファイル名（`RecentProjects.module.scss`）と DevTools 上のハッシュ化後のクラス名（`RecentProjects-module__xxx__statCount`）で分かります。

### 状態クラスを `_` 始まりにする理由

1. **子要素のクラスと区別できる** `_` が付いていれば、付け外しされる状態クラスだとすぐ分かります。
2. **詳細度の確保** 状態クラスは単体では使わず、必ず他のクラスと組み合わせて指定します（`.link._active`）。これにより通常のクラスより詳細度が高くなり、意図した通りに上書きが効きます。
3. **ドット記法で参照できる** Next.js の CSS Modules はクラス名をそのまま JS のキーにします（キャメルケースへの変換はしない）。ハイフン（`is-active`）では `s["is-active"]` とブラケット記法が必要ですが、アンダースコアなら `s._active` と書けます。
