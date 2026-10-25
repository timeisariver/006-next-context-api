"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";
import s from "./Select.module.scss";

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

type Props<T extends string | number> = {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  id?: string;
  "aria-label"?: string;
  // 見えるラベルの id。一覧（listbox）にも同じ名前を付けるため、<label> があるときは渡す
  "aria-labelledby"?: string;
  placeholder?: string;
  size?: "medium" | "small";
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
};

// Radix UI の Select に見た目を当てたプルダウン。
// キーボード操作・読み上げ・開く位置（下に入りきらなければ上に開く）は Radix が受け持つ。
export function Select<T extends string | number>({
  options,
  value,
  onChange,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  placeholder,
  size = "medium",
  disabled = false,
  invalid = false,
  autoFocus,
  className,
}: Props<T>) {
  const isSmall = size === "small";

  return (
    <RadixSelect.Root
      // Radix は値を文字列で扱う。空文字はプレースホルダーを表示する（未選択）
      value={value === null ? "" : String(value)}
      onValueChange={(next) => {
        const option = options.find((o) => String(o.value) === next);
        if (option) onChange(option.value);
      }}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        className={clsx(s.root, { [s._small]: isSmall }, className)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid}
        // 使う側で jsx-a11y/no-autofocus の理由を書いてから渡す。
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
      >
        <span className={s.value}>
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon asChild>
          <ChevronDown className={clsx(s.chevron, { [s._small]: isSmall })} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className={s.content}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          <RadixSelect.Viewport className={s.viewport}>
            {options.map((option) => (
              <RadixSelect.Item
                key={String(option.value)}
                value={String(option.value)}
                className={clsx(s.option, { [s._small]: isSmall })}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
