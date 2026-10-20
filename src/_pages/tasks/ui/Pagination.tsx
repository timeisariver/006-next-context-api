import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import s from "./Pagination.module.scss";

type Props = {
  page: number;
  totalPages: number;
  onSelect: (page: number) => void;
  className?: string;
};

export function Pagination({ page, totalPages, onSelect, className }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className={clsx(s.number, { [s._current]: n === page })}
          aria-current={n === page ? "page" : undefined}
          onClick={() => onSelect(n)}
        >
          {n}
        </button>
      ))}
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
