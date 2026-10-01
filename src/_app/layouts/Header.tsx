import clsx from "clsx";
import styles from "./Header.module.scss";

type Props = {
  className?: string;
};

export function Header({ className }: Props) {
  return (
    <header className={clsx(styles.Header, className)}>
      <span className={styles.Header__logo}>006-next-context-api</span>
    </header>
  );
}
