import { Select, type SelectOption } from "@/shared/ui";
import { LIMITS } from "../lib/params";

type Props = {
  id: string;
  labelId: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
};

const LIMIT_OPTIONS: SelectOption<number>[] = LIMITS.map((limit) => ({
  value: limit,
  label: `${limit} 件`,
}));

export function LimitSelect({
  id,
  labelId,
  value,
  onChange,
  className,
}: Props) {
  return (
    <Select
      id={id}
      aria-labelledby={labelId}
      size="small"
      options={LIMIT_OPTIONS}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
}
