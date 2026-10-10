import Link from "next/link";
import s from "./Header.module.scss";
import { Search, Bell, Info, Plus, User } from "lucide-react";

export function Header() {
  return (
    <header className={s.root}>
      <div className={s.left}>
        <h1 className={s.logo}>
          <Link href="/">Turvo</Link>
        </h1>
        <div className={s.search}>
          <Search />
          <input
            type="text"
            placeholder="タスクタイトルで検索"
            className={s.searchInput}
          />
        </div>
      </div>
      <div className={s.right}>
        <ul className={s.icons}>
          <li className={s.icon}>
            <Plus />
          </li>
          <li className={s.icon}>
            <Info />
          </li>
          <li className={s.icon}>
            <Bell />
          </li>
          <li className={s.icon}>
            <User color="#16a34a" />
          </li>
        </ul>
      </div>
    </header>
  );
}
