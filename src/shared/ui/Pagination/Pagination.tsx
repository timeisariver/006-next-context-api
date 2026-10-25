import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import s from "./Pagination.module.scss";

type Props = {
  page: number;
  totalPages: number;
  // ページ番号から移り先の URL を作る
  getHref: (page: number) => string;
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

export function Pagination({ page, totalPages, getHref, className }: Props) {
  if (totalPages <= 1) return null;

  const items = getItems(page, totalPages);

  return (
    <nav className={clsx(s.root, className)} aria-label="ページ送り">
      {/* 押せない「<」「>」はリンクにせず、読み上げもしない */}
      {page <= 1 ? (
        <span className={clsx(s.arrow, s._disabled)} aria-hidden="true">
          <ChevronLeft size={16} />
        </span>
      ) : (
        <Link
          href={getHref(page - 1)}
          className={s.arrow}
          aria-label="前のページ"
        >
          <ChevronLeft size={16} />
        </Link>
      )}
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className={s.ellipsis} aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={getHref(item)}
            className={clsx(s.number, { [s._current]: item === page })}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Link>
        ),
      )}
      {page >= totalPages ? (
        <span className={clsx(s.arrow, s._disabled)} aria-hidden="true">
          <ChevronRight size={16} />
        </span>
      ) : (
        <Link
          href={getHref(page + 1)}
          className={s.arrow}
          aria-label="次のページ"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
