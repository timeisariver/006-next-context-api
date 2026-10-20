import { ChevronDown } from "lucide-react";
import { LIMITS } from "../lib/params";
import s from "./LimitSelect.module.scss";

type Props = {
  id: string;
  value: number;
  onChange: (value: number) => void;
};

export function LimitSelect({ id, value, onChange }: Props) {
  return (
    <span className={s.root}>
      <select
        id={id}
        className={s.select}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {LIMITS.map((limit) => (
          <option key={limit} value={limit}>
            {limit} 件
          </option>
        ))}
      </select>
      <ChevronDown size={14} className={s.icon} />
    </span>
  );
}
