import { Button } from "@/shared/ui";
import styles from "./HomePage.module.scss";

export function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Home</h1>
      <Button type="button">サンプルボタン</Button>
    </main>
  );
}
