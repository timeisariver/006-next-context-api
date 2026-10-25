import { useEffect, useEffectEvent, useState } from "react";

// 取得した結果。成功したときだけ data を持つ
type Result<T> = { ok: true; data: T } | { ok: false };

// データを取得して、data・isLoading・error を返す。
// 例: const { data, isLoading, error } = useFetch(slug, () => getProject(slug));
export function useFetch<T>(
  // 取得し直す単位。変わると読み込み中から取得し直す。
  // 取得関数で使う値（slug・id など）は、すべて key に含める（含めない値が変わっても取得し直さない）
  key: string,
  fetcher: () => Promise<T>,
  options?: { errorMessage?: string },
) {
  const errorMessage = options?.errorMessage ?? "読み込みに失敗しました";

  // 今の key の取得結果。null のあいだは読み込み中
  const [result, setResult] = useState<Result<T> | null>(null);

  // key が変わったら、前の key の結果を消して読み込み中に戻す。
  // useEffect の中で消すと前の結果が一瞬表示されてしまうため、表示の途中で消す
  // （React の「props が変わったときに state を調整する」書き方）。
  // 例: slug が "a" → "b" に変わったら、"b" の取得が終わるまで "a" の内容を表示しない
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setResult(null);
  }

  // fetcher は呼び出し側で表示のたびに作り直される（() => getProject(slug) など）。
  // そのまま useEffect の依存配列に入れると、表示のたびに取得し直してしまう。
  // useEffectEvent で包むと、最新の fetcher を呼べるうえ、依存配列に入れなくてよい
  const fetchData = useEffectEvent(() => fetcher());

  useEffect(() => {
    // 取得中に key が変わったら（または画面から消えたら）true になる
    let ignore = false;

    async function load() {
      try {
        const data = await fetchData();
        // 前の key の結果が遅れて届いても使わない。
        // 例: "a" の取得中に "b" に変わり、"b" より後に "a" の結果が届いた場合
        if (ignore) return;
        setResult({ ok: true, data });
      } catch {
        if (ignore) return;
        setResult({ ok: false });
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [key]);

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
