# 006-next-context-api

Next.js（App Router）で作るタスク管理アプリ。`app/api/` に配布された API を使い、React の Context API で状態を管理する。

## 技術スタック

- Next.js 16 / React 19（React Compiler 有効）
- TypeScript
- SCSS（CSS Modules）+ [clsx](https://github.com/lukeed/clsx)
- ESLint / Prettier

## はじめかた

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

| コマンド               | 内容                          |
| ---------------------- | ----------------------------- |
| `npm run dev`          | 開発サーバーを起動            |
| `npm run build`        | 本番ビルド                    |
| `npm run lint`         | ESLint でチェック             |
| `npm run format`       | Prettier で整形               |
| `npm run format:check` | Prettier の整形漏れをチェック |

## ドキュメント

- [ディレクトリ構成（Feature-Sliced Design）](docs/architecture.md) — レイヤー・スライス・セグメントの分け方と依存ルール
- [CSS 命名規則（変形 BEM）](docs/css-naming.md) — クラス名の付け方と CSS Modules・clsx の使い方

### 要点

- ルートの `app/` は Next.js のルーティング専用。画面は `src/_pages/` に作り、`app/` からは再エクスポートするだけにする。
- `app/api/` は教材として配布された API のため改変しない。
- クラス名は `.ComponentName`・`.ComponentName__element`・`._modifier` の形にし、JSX では `clsx(styles.X, { [styles._active]: isActive })` のように指定する。
