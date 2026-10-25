import dayjs from "dayjs";

// "2026-10-28T12:34:56+09:00" の先頭の年-月-日だけを使う（タイムゾーン変換はしない）
export function toDateString(value: string) {
  return value.slice(0, 10);
}

// "2026/10/28" 形式
export function toDisplay(value: string) {
  return toDateString(value).replaceAll("-", "/");
}

// "2026/11/04" を "2026-11-04" にする。日付として正しくなければ null
export function parseSlashDate(value: string) {
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

// 進捗サマリーの日付（Stats の date）は数値のため、数値も受け付ける
export function formatDate(value: string | number, format = "YYYY/MM/DD") {
  return dayjs(value).format(format);
}

// 期限までの残り日数（「あと N 日」「今日まで」「N 日超過」）
export function formatRemaining(deadline: string) {
  const days = dayjs(deadline)
    .startOf("day")
    .diff(dayjs().startOf("day"), "day");
  if (days > 0) return `あと ${days} 日`;
  if (days === 0) return "今日まで";
  return `${-days} 日超過`;
}

// ローカル時刻の今日を "YYYY-MM-DD" 形式で返す
export function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
