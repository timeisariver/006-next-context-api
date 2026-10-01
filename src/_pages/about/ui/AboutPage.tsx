import Link from "next/link";
import styles from "./AboutPage.module.scss";

export function AboutPage() {
  return (
    <main className={styles.AboutPage}>
      <h1 className={styles.AboutPage__title}>About</h1>
      <p>サンプルの下層ページです。</p>
      <Link href="/" className={styles.AboutPage__link}>
        Home に戻る
      </Link>
    </main>
  );
}
