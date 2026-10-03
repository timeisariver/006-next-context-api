import s from "./Header.module.scss";
import { Search, Bell, Info, Plus, User } from "lucide-react";

export function Header() {
  return (
    <header className={s.Header}>
      <div className={s.Header__left}>
        <h1 className={s.Header__logo}>Turvo</h1>
        <div className={s.Header__search}>
          <Search />
          <input
            type="text"
            placeholder="タスクタイトルで検索"
            className={s.Header__searchInput}
          />
        </div>
      </div>
      <div className={s.Header__right}>
        <ul className={s.Header__icons}>
          <li className={s.Header__icon}>
            <Plus />
          </li>
          <li className={s.Header__icon}>
            <Info />
          </li>
          <li className={s.Header__icon}>
            <Bell />
          </li>
          <li className={s.Header__icon}>
            <User color="#16a34a" />
          </li>
        </ul>
      </div>
    </header>
  );
}
