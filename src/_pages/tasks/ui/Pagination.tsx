import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import s from "./Pagination.module.scss";

type Props = {
  page: number;
  totalPages: number;
  onSelect: (page: number) => void;
  className?: string;
};

// ページ数が多いときは、先頭・末尾・今のページとその前後だけを並べ、あいだを "…" で省く
const SIBLINGS = 1;
const MAX_ALL = 7;

function getItems(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= MAX_ALL) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const start = Math.max(2, page - SIBLINGS);
  const end = Math.min(totalPages - 1, page + SIBLINGS);
  const items: (number | "…")[] = [1];
  if (start > 2) items.push("…");
  for (let n = start; n <= end; n++) items.push(n);
  if (end < totalPages - 1) items.push("…");
  items.push(totalPages);
  return items;
}

export function Pagination({ page, totalPages, onSelect, className }: Props) {
  const items = getItems(page, totalPages);

  return (
    <nav className={clsx(s.root, className)} aria-label="ページ送り">
      <button
        type="button"
        className={s.arrow}
        aria-label="前のページ"
        disabled={page <= 1}
        onClick={() => onSelect(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className={s.ellipsis} aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={clsx(s.number, { [s._current]: item === page })}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={s.arrow}
        aria-label="次のページ"
        disabled={page >= totalPages}
        onClick={() => onSelect(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
