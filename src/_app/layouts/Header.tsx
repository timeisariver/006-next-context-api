import clsx from "clsx";
import Link from "next/link";
import s from "./Header.module.scss";
import { Search, Bell, Info, Plus, User } from "lucide-react";

type Props = {
  className?: string;
};

// TODO: 各ボタンの動作は未実装
const ACTIONS = [
  { label: "タスクを追加", Icon: Plus },
  { label: "ヘルプ", Icon: Info },
  { label: "通知", Icon: Bell },
];

export function Header({ className }: Props) {
  return (
    <header className={clsx(s.root, className)}>
      <div className={s.left}>
        <Link href="/" className={s.logo}>
          Turvo
        </Link>
        <div className={s.search}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="タスクタイトルで検索"
            aria-label="タスクタイトルで検索"
            className={s.searchInput}
          />
        </div>
      </div>
      <ul className={s.actions}>
        {ACTIONS.map(({ label, Icon }) => (
          <li key={label}>
            <button type="button" className={s.action} aria-label={label}>
              <Icon />
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={clsx(s.action, s.avatar)}
            aria-label="アカウント"
          >
            <User />
          </button>
        </li>
      </ul>
    </header>
  );
}
