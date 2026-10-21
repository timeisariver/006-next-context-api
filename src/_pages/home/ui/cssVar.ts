// Chart.js は canvas に描くため、CSS 変数の値を読み出して使う。
export function readCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
