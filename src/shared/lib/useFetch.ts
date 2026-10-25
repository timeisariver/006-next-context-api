import { useEffect, useEffectEvent, useState } from "react";

// 取得した結果と、そのときの key。成功したときだけ data を持つ
type Result<T> =
  { key: string; ok: true; data: T } | { key: string; ok: false };

export function useFetch<T>(
  // 取得し直す単位。変わると読み込み中から取得し直す。
  // 取得関数で使う値（slug・id など）は、すべて key に含める（含めない値が変わっても取得し直さない）
  key: string,
  fetcher: () => Promise<T>,
  options?: { errorMessage?: string },
) {
  const errorMessage = options?.errorMessage ?? "読み込みに失敗しました";

  // 最後に取得した結果。key が今の key と違うあいだは読み込み中として扱う
  const [result, setResult] = useState<Result<T> | null>(null);

  // key が変わったら前の結果を捨てる。A → B → A と戻ったときに、前の A の結果を表示しないため
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setResult(null);
  }

  // 取得関数は毎回のレンダーで新しく作られるため、useEffect の依存配列に入れない
  const fetchData = useEffectEvent(() => fetcher());

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchData();
        if (ignore) return;
        setResult({ key, ok: true, data });
      } catch {
        if (ignore) return;
        setResult({ key, ok: false });
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [key]);

  const current = result?.key === key ? result : null;

  return {
    data: current?.ok ? current.data : null,
    isLoading: current === null,
    error: current && !current.ok ? errorMessage : null,
    // 取得したデータを書き換える（読み込み中・失敗したときは何もしない）
    setData: (update: (prev: T) => T) => {
      setResult((prev) =>
        prev && prev.key === key && prev.ok
          ? { ...prev, data: update(prev.data) }
          : prev,
      );
    },
  };
}
