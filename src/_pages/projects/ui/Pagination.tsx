import clsx from "clsx";
import Link from "next/link";
import s from "./Pagination.module.scss";

type Props = {
  page: number;
  totalPages: number;
  className?: string;
};

export function Pagination({ page, totalPages, className }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={clsx(s.root, className)} aria-label="ページ送り">
      {page > 1 ? (
        <Link href={`?page=${page - 1}`} className={s.item}>
          前へ
        </Link>
      ) : (
        <span className={clsx(s.item, s._disabled)}>前へ</span>
      )}
      {pages.map((n) => (
        <Link
          key={n}
          href={`?page=${n}`}
          className={clsx(s.item, { [s._current]: n === page })}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={`?page=${page + 1}`} className={s.item}>
          次へ
        </Link>
      ) : (
        <span className={clsx(s.item, s._disabled)}>次へ</span>
      )}
    </nav>
  );
}
