# CSS 命名規則（変形 BEM）

本プロジェクトでは、BEM をベースに Modifier の記法のみ変更した命名規則を採用しています。スタイルは CSS Modules（`*.module.scss`）で書き、クラス名の結合には [clsx](https://github.com/lukeed/clsx) を使います。

| 種類     | セレクタ                                                          | 用途                       |
| -------- | ----------------------------------------------------------------- | -------------------------- |
| Block    | `.ComponentName`                                                  | コンポーネントのルート要素 |
| Element  | `.ComponentName__element`                                         | Block 内の子要素           |
| Modifier | `.ComponentName._modifier`<br>`.ComponentName__element._modifier` | 状態・バリエーション       |

## ルール

### 命名

- Block 名はコンポーネント名（＝ファイル名）と一致させ、PascalCase で記述する（`TabPanel.tsx` → `TabPanel.module.scss` → `.TabPanel`）
- 1 つの `.module.scss` に Block は 1 つだけ定義する
- Element 名・Modifier 名はハイフンを使わず camelCase で記述する（例: `.TabPanel__tabList`、`._fullWidth`）。ドット記法で参照できるようにするため
- Element のネストは 1 階層まで（`.ComponentName__a__b` は禁止）。深くなる場合はコンポーネント分割を検討する
- Modifier 名は状態やバリエーションを表す形容詞・状態名にする（例: `_active`, `_disabled`, `_large`, `_primary`）

### SCSS

- `_modifier` は**単体でスタイルを定義しない**。必ず `&._modifier` とネストし、`.Block._modifier` または `.Block__element._modifier` の形で指定する
- 要素セレクタ（`p`, `div` など）への直接指定は避け、必ずクラスを付与する
- `:global` は使わない。グローバルなスタイルは `src/_app/styles/` に置く

### TSX

- クラス名は必ず `styles.xxx` 経由で指定し、`className="TabPanel__tab"` のような文字列リテラルは使わない
- 複数のクラスの結合や条件付きのクラスには `clsx` を使う（`[a, b].join(" ")` やテンプレートリテラルは使わない）
- コンポーネントは `className` props を受け取り、ルート要素で `clsx(styles.Block, className)` と結合する。外側から余白などを調整したい場合はこの `className` を使い、親のスタイルから子コンポーネントの内部のクラスを上書きしない

## 記述例

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

### バリエーションを props で受け取る場合

`size` や `variant` のような props は、値をそのまま Modifier 名に対応させます。

```scss
// Button.module.scss
.Button {
  &._small {
    padding: 4px 8px;
  }

  &._large {
    padding: 12px 24px;
  }

  &._primary {
    background: var(--primary-color);
  }

  &._secondary {
    background: transparent;
  }
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
/>;
```

## 背景

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
3. **ドット記法で参照できる** Next.js の CSS Modules はクラス名をそのまま JS のキーにします（キャメルケースへの変換はしない）。ハイフンは JS の識別子に使えないため、`styles['is-active']` のようにブラケット記法が必要になります。アンダースコアならすべてのクラスを `styles._active` のようにドット記法で参照できます。

   ```tsx
   // ハイフン区切り：ブラケット記法が必須
   styles["TabPanel__tab--active"];

   // アンダースコア区切り：ドット記法で書ける
   styles._active;
   ```

   また、エディタでダブルクリックしたときの単語選択も、アンダースコアは 1 語として選択されますが、ハイフンは区切りとして扱われるため分断されます。
