import { DashboardHead } from "@/shared/ui/DashboardHead/DashboardHead";
import s from "./Summary.module.scss";

export function Summary() {
  return (
    <section className={s.root}>
      <DashboardHead text="進捗サマリー" />
    </section>
  );
}
