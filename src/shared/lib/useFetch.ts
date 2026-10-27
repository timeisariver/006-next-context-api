import { useEffect, useEffectEvent, useState } from "react";

// 取得した結果。成功したときだけ data を持つ
type Result<T> = { ok: true; data: T } | { ok: false };

// 画面に出たときに 1 回だけデータを取得して、data・isLoading・error を返す。
// 例: const { data, isLoading, error } = useFetch(() => getProject(slug));
// key を渡すと、key が変わるたびに取り直す。取り直しのあいだは前の結果を返す。
// 例: useFetch(() => getTasks(params), { key: revision });
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options?: {
    errorMessage?: string;
    // この値が変わったら取り直す（前の結果を表示したまま）
    key?: string | number;
  },
) {
  const errorMessage = options?.errorMessage ?? "読み込みに失敗しました";
  const key = options?.key;

  // 取得結果。null のあいだは読み込み中（取り直しのあいだは前の結果のまま）
  const [result, setResult] = useState<Result<T> | null>(null);

  // fetcher は呼び出し側で表示のたびに作り直される（() => getProject(slug) など）。
  // そのまま useEffect の依存配列に入れると、表示のたびに取得し直してしまう。
  // useEffectEvent で包むと、依存配列に入れなくてよい
  const fetchData = useEffectEvent(() => fetcher());

  useEffect(() => {
    // key が続けて変わったときに、古い取得の結果で上書きしないようにする
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchData();
        if (!cancelled) setResult({ ok: true, data });
      } catch {
        if (!cancelled) setResult({ ok: false });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    data: result?.ok ? result.data : null,
    isLoading: result === null,
    error: result && !result.ok ? errorMessage : null,
    // 取得したデータを書き換える（読み込み中・失敗したときは何もしない）。
    // 例: タスクの表でステータスを変えたときに、その行だけ置き換える
    setData: (update: (prev: T) => T) => {
      setResult((prev) => {
        // 読み込み中・失敗したときは、書き換えるデータがないのでそのまま
        if (!prev?.ok) return prev;
        return { ok: true, data: update(prev.data) };
      });
    },
  };
}
