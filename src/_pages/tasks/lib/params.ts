export const LIMITS = [20, 50, 100];

export const DEFAULT_LIMIT = 20;

export function parseLimit(value: string | null): number {
  const limit = Number(value);
  return LIMITS.includes(limit) ? limit : DEFAULT_LIMIT;
}

// 初期値（20 件・1 ページ目）はクエリに含めない
export function buildHref(pathname: string, page: number, limit: number) {
  const params = new URLSearchParams();
  if (limit !== DEFAULT_LIMIT) params.set("limit", String(limit));
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
