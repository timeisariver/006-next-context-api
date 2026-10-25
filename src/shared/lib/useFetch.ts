import { useEffect, useEffectEvent, useState } from "react";

// 取得した結果と、そのときの key。成功したときだけ data を持つ
type Result<T> =
  | { key: string; data: T; error: null }
  | { key: string; data: null; error: string };

export function useFetch<T>(
  // 取得し直す単位。変わると読み込み中から取得し直す
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

  // 取得関数と文言は毎回のレンダーで新しく作られるため、useEffect の依存配列に入れない
  const fetchData = useEffectEvent(() => fetcher());
  const getErrorMessage = useEffectEvent(() => errorMessage);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchData();
        if (ignore) return;
        setResult({ key, data, error: null });
      } catch {
        if (ignore) return;
        setResult({ key, data: null, error: getErrorMessage() });
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [key]);

  const current = result?.key === key ? result : null;

  return {
    data: current ? current.data : null,
    isLoading: current === null,
    error: current ? current.error : null,
    // 取得したデータを書き換える（読み込み中・失敗したときは何もしない）
    setData: (update: (prev: T) => T) => {
      setResult((prev) =>
        prev && prev.key === key && prev.error === null
          ? { ...prev, data: update(prev.data) }
          : prev,
      );
    },
  };
}
