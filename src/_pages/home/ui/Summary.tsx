import clsx from "clsx";
import { DashboardHead } from "@/shared/ui";
import s from "./Summary.module.scss";

type Props = {
  className?: string;
};

export function Summary({ className }: Props) {
  return (
    <section className={clsx(s.root, className)}>
      <DashboardHead text="進捗サマリー" />
    </section>
  );
}
