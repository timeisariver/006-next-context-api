---
paths:
  - "src/shared/api/**"
  - "app/api/**"
---

# API のレスポンス型と仕様の確かめ方

API のレスポンス型の書き方と、API の仕様の確かめ方。

- `app/api/` は教材として配布された API のため改変しない（例外は `docs/architecture.md` の「その他のルール」）。
- API のレスポンス型（`Project` など）は `src/shared/api/` に手書きしている。API 側の変更を型に反映するときは、`app/api/v1/spec/swagger.yml/swagger.yml` を参照する（開発サーバー起動中は `http://localhost:3000/api/v1/spec` でも読める）。
- ただし swagger.yml の `UpdateTask`（`PATCH /users/tasks/{id}` のリクエスト）は誤っている。`app/api/v1/users/tasks/[id]/route.js` と `app/api/datastore/models/task.ts` の `assign()` を参照する（`projectId`・`title`・`description`・`status`・`deadline` を受け付ける）。
- `src/shared/api/index.ts` は `.gitattributes` で `merge=union` にしている。並行するブランチが export を足しても競合しないが、同じ行を書き換えると両方残って重複するので、マージ後に確認する（詳細は `docs/development.md` の「Git の設定」）。
