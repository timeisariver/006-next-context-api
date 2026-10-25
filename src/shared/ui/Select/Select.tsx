"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
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
  placeholder?: string;
  size?: "medium" | "small";
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
};

// WAI-ARIA Authoring Practices の「Select-Only Combobox」に沿ったプルダウン。
// 標準の <select> では開いた一覧に CSS を当てられないため、button と ul で組む。
export function Select<T extends string | number>({
  options,
  value,
  onChange,
  id,
  "aria-label": ariaLabel,
  placeholder,
  size = "medium",
  disabled = false,
  invalid = false,
  autoFocus,
  className,
}: Props<T>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // キーボードやマウスで移動中の項目
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const isSmall = size === "small";

  function optionId(index: number) {
    return `${listboxId}-${index}`;
  }

  function open() {
    if (disabled || options.length === 0) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function select(index: number) {
    const option = options[index];
    close();
    buttonRef.current?.focus();
    if (option && option.value !== value) onChange(option.value);
  }

  // 開いている間だけ、一覧の外のクリックを拾って閉じる
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // 移動中の項目が一覧の中で見えるようにスクロールする
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const item = listRef.current?.children[activeIndex];
    item?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        select(activeIndex);
        break;
      case "Escape":
        // モーダルの中で使っても、モーダルごと閉じないようにする
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  return (
    <div ref={rootRef} className={clsx(s.root, className)}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        role="combobox"
        className={clsx(s.button, { [s._small]: isSmall })}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-invalid={invalid}
        disabled={disabled}
        // 使う側で jsx-a11y/no-autofocus の理由を書いてから渡す。
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        // Space の keyup で button のクリックが起き、開いた一覧がすぐ閉じないようにする
        onKeyUp={(e) => {
          if (e.key === " ") e.preventDefault();
        }}
      >
        <span className={clsx(s.value, { [s._placeholder]: !selected })}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(s.chevron, { [s._small]: isSmall })}
          aria-hidden="true"
        />
      </button>
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel}
        className={clsx(s.listbox, { [s._open]: isOpen })}
        // 項目のクリックで本体からフォーカスが外れないようにする
        onMouseDown={(e) => e.preventDefault()}
      >
        {options.map((option, index) => (
          // キーボード操作は本体（combobox）の onKeyDown で扱い、項目にはフォーカスを移さない
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={String(option.value)}
            id={optionId(index)}
            role="option"
            aria-selected={index === selectedIndex}
            className={clsx(s.option, {
              [s._small]: isSmall,
              [s._selected]: index === selectedIndex,
              [s._active]: index === activeIndex,
            })}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => select(index)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
