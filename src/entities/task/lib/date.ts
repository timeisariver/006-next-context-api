// "2026-10-28T12:34:56+09:00" の先頭の年-月-日だけを使う（タイムゾーン変換はしない）
export function toDateString(deadline: string) {
  return deadline.slice(0, 10);
}

// "2026/10/28" 形式
export function toDisplay(deadline: string) {
  return toDateString(deadline).replaceAll("-", "/");
}
