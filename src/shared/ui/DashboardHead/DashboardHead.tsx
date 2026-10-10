import clsx from "clsx";
import s from "./DashboardHead.module.scss";

type Props = {
  text: string;
  className?: string;
};

export function DashboardHead({ text, className }: Props) {
  return <h2 className={clsx(s.root, className)}>{text}</h2>;
}
