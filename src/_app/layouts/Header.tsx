import clsx from "clsx";
import styles from "./Header.module.scss";
import { Search, Bell, Info, Plus, User } from "lucide-react";

type Props = {
  className?: string;
};

export function Header({ className }: Props) {
  return (
    <header className={clsx(styles.Header, className)}>
      <div className={styles.Header__left}>
        <h1 className={styles.Header__logo}>Turvo</h1>
        <div className={styles.Header__search}>
          <Search />
          <input
            type="text"
            placeholder="タスクタイトルで検索"
            className={styles.Header__searchInput}
          />
        </div>
      </div>
      <div className={styles.Header__right}>
        <ul className={styles.Header__icons}>
          <li className={styles.Header__icon}>
            <Plus />
          </li>
          <li className={styles.Header__icon}>
            <Info />
          </li>
          <li className={styles.Header__icon}>
            <Bell />
          </li>
          <li className={styles.Header__icon}>
            <User color="#16a34a" />
          </li>
        </ul>
      </div>
    </header>
  );
}
