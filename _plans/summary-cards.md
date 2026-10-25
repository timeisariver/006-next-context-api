# 進捗サマリーの集計カード改善 実装プラン

- 仕様書: [\_specs/summary-cards.md](../_specs/summary-cards.md)
- ブランチ: `feature/summary-cards`

## 方針

変更はダッシュボードの「進捗サマリー」の集計カードだけで、使うのも `_pages/home` だけなので、すべて `src/_pages/home/ui/` に置く。`shared`・`entities` には切り出さない。

- 既存の `Summary.tsx` のカード部分を書き換え、`CompletionDonut.tsx` の輪の中央に完了率を出す。
- 前週比（増減率と「前週比」の文字）は 3 枚のカードで同じ見た目なので、`_pages/home/ui/` に小さなコンポーネント `WeekOverWeek` を作り、3 か所で使う。
- 前週比の値は固定のダミー値とし、`Summary.tsx` に定数で置く。今の「週」ボタンと同じ書き方の `TODO` コメントで「見た目のみ」と分かるようにする。

変更するファイルが 1 スライスに収まり小さいため、1 タスクにする。

## タスク

### 第 1 段階

#### タスク 1: 集計カードに前週比を加え、完了率をドーナツの中に出す

- 目的: 集計カード 3 枚の表記を参考画像に合わせる。
- 担当範囲:
  - `src/_pages/home/ui/Summary.tsx`、`src/_pages/home/ui/Summary.module.scss`（カードの並びと文字の大きさ）
  - `src/_pages/home/ui/CompletionDonut.tsx`、`src/_pages/home/ui/CompletionDonut.module.scss`（輪の中央の完了率）
  - `src/_pages/home/ui/WeekOverWeek.tsx`、`src/_pages/home/ui/WeekOverWeek.module.scss`（新規）
- 要件:
  - 完了タスク・予定タスクのカード: すべて
  - 前週比の値と表記: すべて
  - 完了率のカード: すべて
  - 共通: 3 枚のカードのラベル・数値の位置と高さをそろえる
- 公開 API（スライス内でだけ使い、`src/_pages/home/index.ts` からは export しない）:
  - `WeekOverWeek({ value, className }: { value: number; className?: string })` — `value` は整数のパーセント（完了率ではポイント）。`+44%`／`-12%`／`±0%` と、灰色の「前週比」を横に並べて描く。色はプラスが `--color-primary`、マイナスが `--color-danger`、0 が `--color-text-sub`（状態クラス `._up`・`._down`・`._flat` で切り替える）。
  - `CompletionDonut({ completed, todo, className })` — props は今と同じ。完了率（`Math.round(completed / (completed + todo) * 100)`、合計 0 なら 0）を輪の中央に太字で重ねて描く。

### 第 2 段階

なし。

## 判断した点

- **前週比のコンポーネントを作る**: 増減率の書式と色分けは 3 枚で同じなので、`Summary.tsx` に 3 回書かずに `WeekOverWeek` にまとめる。ダッシュボードでしか使わないため `_pages/home` に置く。
- **完了率の計算を `CompletionDonut` に寄せる**: 輪の中央に完了率を描くのは `CompletionDonut` なので、計算もそちらで行う。`Summary.tsx` が持っていた `rate` の計算と、輪の外の完了率の表示はなくす。
- **完了率の文字は canvas の外に HTML で重ねる**: Chart.js のプラグインで canvas に描かず、`CompletionDonut` のルート要素（`position: relative`）の中央に `<span>` を絶対配置する。文字の色やフォントを CSS 変数で指定でき、読み上げにも乗るため。
- **ダミー値の置き場所**: `Summary.tsx` に定数（例: `WEEK_OVER_WEEK = { completed: 44, todo: 36, rate: 8 }`）で置き、`TODO: 前週のデータが API にないため固定値（見た目のみ）` とコメントする。実データに置き換えるときに 1 か所で済む。
- **数値とドーナツの高さ**: 完了タスク・予定タスクの数値の行と、完了率のドーナツの行は、同じ高さの行にして縦方向の中央をそろえる。ドーナツは今の 72px から参考画像に合わせて 56px 前後に小さくし、数値（28px）と高さを合わせる。
