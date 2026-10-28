# 表示幅の固定（viewport） 実装プラン

- 仕様書: [\_specs/fixed-viewport.md](../_specs/fixed-viewport.md)
- ブランチ: `feature/fixed-viewport`

## 方針

変更はルートレイアウトだけで済むため、`src/_app/layouts` の 1 タスクにする。新しいスライスや共通部品は作らない。

- **viewport の指定**: `metadata` と同じく `src/_app/layouts/RootLayout.tsx` で Next.js の `viewport` オブジェクト（型は `next` の `Viewport`）を定義して export し、`index.ts` と `app/layout.tsx` で `metadata` と並べて再エクスポートする。Next.js は `app/layout.tsx` から export された `viewport` しか読まないため、再エクスポートが必須。
- **PC で狭めたときの横スクロール**: `RootLayout.module.scss` の `.root`（`body`）に `min-width: 1440px` を付ける。今の `.root` は `overflow: hidden` で、`body` の `overflow` はページ全体（viewport）に伝わるため、このままでは横にはみ出した部分が切れて見えない。縦だけを止めて横はスクロールできるように `overflow` を直す。
- 1440 という幅は `viewport` と SCSS の 2 か所に出てくる。それぞれに、もう一方と合わせる必要があることをコメントで書く。

## タスク

### 第 1 段階

#### タスク 1: ルートレイアウトの表示幅を 1440px に固定する

- 目的: スマホ・タブレットでは viewport を 1440px に固定してデスクトップのレイアウトを縮小表示し、PC でウィンドウを狭めたときはレイアウトの幅を保って横スクロールさせる。
- 担当範囲:
  - `src/_app/layouts/RootLayout.tsx`（`viewport` の定義と export）
  - `src/_app/layouts/index.ts`（`viewport` の再エクスポート）
  - `app/layout.tsx`（`viewport` の再エクスポート）
  - `src/_app/layouts/RootLayout.module.scss`（`.root` の `min-width` と `overflow`）
- 要件:
  - すべてのページの `<head>` に `<meta name="viewport" content="width=1440">` が 1 つだけ出力される（既定の `width=device-width, initial-scale=1` は出ない）。
  - 390px 幅のスマホで、デスクトップと同じレイアウトが画面幅に収まるよう縮小表示され、横スクロールが出ない。
  - ピンチ操作で拡大できる（`maximumScale`・`userScalable` などの拡大を禁止する指定をしない）。
  - PC でウィンドウを 1440px より狭めても、レイアウトは 1440px の幅を保ち、ページ全体を横スクロールして右端まで見られる。
  - ウィンドウが 1440px 以上なら、変更前と同じく画面幅いっぱいに広がり、横スクロールは出ない。
  - サイドバー・本文の中だけが縦にスクロールし、ヘッダーが上に固定されている動きは変わらない（ページ全体は縦にスクロールしない）。
- 公開 API:
  - `src/_app/layouts` から `viewport: Viewport`（`{ width: "1440" }` 相当。出力が `width=1440` だけになること）を export する。`RootLayout`・`metadata` は今のまま。
- 確認:
  - `npm run build` 後か開発サーバーで、ページの HTML に viewport の meta が 1 つだけ出ていること。
  - 開発者ツールのデバイスモード（iPhone 14、390px）で縮小表示され、横スクロールが出ないこと。
  - PC でウィンドウを 1000px ほどに狭めて横スクロールで右端（ヘッダー右のアイコン）まで見られること。横スクロールバーが出たときに、サイドバー・本文の下端が隠れて最後まで縦スクロールできなくなっていないこと（`100dvh` の高さとスクロールバーの兼ね合いに注意）。
  - タスク追加モーダル・トースト・プルダウン（`position: fixed` や Portal で表示するもの）が、狭めた状態でも画面内に表示されること。

## 判断した点

- 1 タスクにまとめた。変更は `_app/layouts` と `app/layout.tsx` の 4 ファイルだけで、分けると同じファイルを触るため。
- viewport は `generateViewport` ではなく静的な `viewport` オブジェクトにした。リクエストによって変わらないため（Next.js のドキュメントでも静的なほうを勧めている）。
- `initialScale` は指定しない。指定しないと、各端末が 1440px を画面幅に収まる倍率で表示する。
- PC の横スクロールは、`body`（`.root`）に `min-width` を付けて実現する。ヘッダーとサイドバー・本文を包む要素を新たに足す方法もあるが、今の構成のまま `.root` の指定を直すほうが変更が小さい。`overflow` の具体的な直し方は実装で確かめて決めてよい（上の「確認」を満たすこと）。
