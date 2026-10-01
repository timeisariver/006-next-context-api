import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>006-next-context-api</span>
    </header>
  );
}
