import { useEffect, useEffectEvent, useState } from "react";

// 取得した結果。成功したときだけ data を持つ
type Result<T> = { ok: true; data: T } | { ok: false };

// 画面に出たときに 1 回だけデータを取得して、data・isLoading・error を返す。
// 例: const { data, isLoading, error } = useFetch(() => getProject(slug));
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options?: { errorMessage?: string },
) {
  const errorMessage = options?.errorMessage ?? "読み込みに失敗しました";

  // 取得結果。null のあいだは読み込み中
  const [result, setResult] = useState<Result<T> | null>(null);

  // fetcher は呼び出し側で表示のたびに作り直される（() => getProject(slug) など）。
  // そのまま useEffect の依存配列に入れると、表示のたびに取得し直してしまう。
  // useEffectEvent で包むと、依存配列に入れなくてよい
  const fetchData = useEffectEvent(() => fetcher());

  useEffect(() => {
    async function load() {
      try {
        setResult({ ok: true, data: await fetchData() });
      } catch {
        setResult({ ok: false });
      }
    }

    load();
  }, []);

  return {
    data: result?.ok ? result.data : null,
    isLoading: result === null,
    error: result && !result.ok ? errorMessage : null,
    // 取得したデータを書き換える（読み込み中・失敗したときは何もしない）。
    // 例: タスクの表でステータスを変えたときに、その行だけ置き換える
    setData: (update: (prev: T) => T) => {
      setResult((prev) =>
        prev?.ok ? { ok: true, data: update(prev.data) } : prev,
      );
    },
  };
}
