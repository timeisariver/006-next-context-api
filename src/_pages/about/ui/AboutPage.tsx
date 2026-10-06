import Link from "next/link";
import s from "./AboutPage.module.scss";

export function AboutPage() {
  return (
    <main className={s.AboutPage}>
      <h1 className={s.AboutPage__title}>About</h1>
      <p>サンプルの下層ページです。</p>
      <Link href="/" className={s.AboutPage__link}>
        Home に戻る
      </Link>
    </main>
  );
}
