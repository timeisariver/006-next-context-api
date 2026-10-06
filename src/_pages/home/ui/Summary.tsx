import { DashboardHead } from "@/shared/ui/DashboardHead/DashboardHead";
import s from "./Summary.module.scss";

export function Summary() {
  return (
    <section className={s.Summary}>
      <DashboardHead text="進捗サマリー" />
    </section>
  );
}
