import clsx from "clsx";
import s from "./WeekOverWeek.module.scss";

type Props = {
  // 整数のパーセント（完了率ではポイント）
  value: number;
  className?: string;
};

function formatRate(value: number): string {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return "±0%";
}

export function WeekOverWeek({ value, className }: Props) {
  return (
    <p className={clsx(s.root, className)}>
      <span
        className={clsx(s.rate, {
          [s._up]: value > 0,
          [s._down]: value < 0,
          [s._flat]: value === 0,
        })}
      >
        {formatRate(value)}
      </span>
      <span className={s.label}>前週比</span>
    </p>
  );
}
