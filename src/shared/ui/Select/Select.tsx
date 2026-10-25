"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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

// PageUp / PageDown で移動する項目の数
const PAGE_SIZE = 10;
// 続けて打った文字を 1 つの検索語として扱う時間（ミリ秒）
const TYPEAHEAD_TIMEOUT = 500;

// 祖先のスクロール領域と画面のうち、一覧を表示できる上端と下端
function getVisibleBounds(element: HTMLElement) {
  let top = 0;
  let bottom = window.innerHeight;
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    if (getComputedStyle(parent).overflowY === "visible") continue;
    const rect = parent.getBoundingClientRect();
    top = Math.max(top, rect.top);
    bottom = Math.min(bottom, rect.bottom);
  }
  return { top, bottom };
}

// WAI-ARIA Authoring Practices の「Select-Only Combobox」に沿ったプルダウン。
// 標準の <select> では開いた一覧に CSS を当てられないため、button と ul で組む。
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
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeaheadRef = useRef({ query: "", timer: 0 });
  const [isOpen, setIsOpen] = useState(false);
  // 下に入りきらないときは上に開く
  const [isAbove, setIsAbove] = useState(false);
  // キーボードやマウスで移動中の項目。開いている間に選択肢が変わってもずれないよう、値で持つ
  const [activeValue, setActiveValue] = useState<T | null>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const foundActiveIndex = options.findIndex(
    (option) => option.value === activeValue,
  );
  // 移動中の項目が選択肢からなくなったときは、選んでいる項目（なければ先頭）に戻す
  const activeIndex =
    !isOpen || options.length === 0
      ? -1
      : foundActiveIndex >= 0
        ? foundActiveIndex
        : Math.max(selectedIndex, 0);
  const isSmall = size === "small";

  function optionId(index: number) {
    return `${listboxId}-${index}`;
  }

  function moveTo(index: number) {
    const option =
      options[Math.min(Math.max(index, 0), options.length - 1)] ?? null;
    setActiveValue(option ? option.value : null);
  }

  function open(index = selectedIndex) {
    if (disabled || options.length === 0) return;
    moveTo(index);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setActiveValue(null);
  }

  function select(index: number, { focus = true } = {}) {
    const option = options[index];
    close();
    if (focus) buttonRef.current?.focus();
    if (option && option.value !== value) onChange(option.value);
  }

  // 打った文字で始まる項目を探す。同じ文字を続けて打つと、その文字で始まる次の項目に進む
  function findByTypeahead(key: string) {
    const typeahead = typeaheadRef.current;
    window.clearTimeout(typeahead.timer);
    typeahead.timer = window.setTimeout(() => {
      typeahead.query = "";
    }, TYPEAHEAD_TIMEOUT);
    typeahead.query += key.toLowerCase();

    const query = typeahead.query;
    const isRepeated = [...query].every((char) => char === query[0]);
    const search = isRepeated ? query[0] : query;
    const start = isOpen
      ? activeIndex + (isRepeated ? 1 : 0)
      : selectedIndex + 1;
    const ordered = [...options.slice(start), ...options.slice(0, start)];
    const match = ordered.find((option) =>
      option.label.toLowerCase().startsWith(search),
    );
    return match ? options.indexOf(match) : -1;
  }

  // 開いている間だけ、一覧の外のクリックを拾って閉じる
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      // 結び付いた <label> のクリックは本体のクリックとして開閉されるので、ここでは閉じない
      const labels = Array.from(buttonRef.current?.labels ?? []);
      if (labels.some((label) => label.contains(target))) return;
      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
        setActiveValue(null);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // 開いたときに、一覧が下に入りきるかを測って開く向きを決める（描画前に決めてちらつかせない）
  useLayoutEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!isOpen || !root || !list) return;
    const rect = root.getBoundingClientRect();
    const bounds = getVisibleBounds(root);
    const spaceBelow = bounds.bottom - rect.bottom;
    const spaceAbove = rect.top - bounds.top;
    setIsAbove(list.offsetHeight > spaceBelow && spaceAbove > spaceBelow);
  }, [isOpen]);

  // 移動中の項目が一覧の中で見えるようにスクロールする。
  // scrollIntoView はページやモーダルまでスクロールさせるため、一覧の scrollTop だけを動かす
  useEffect(() => {
    const list = listRef.current;
    if (!isOpen || activeIndex < 0 || !list) return;
    const item = list.children[activeIndex] as HTMLElement | undefined;
    if (!item) return;
    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (
      item.offsetTop + item.offsetHeight >
      list.scrollTop + list.clientHeight
    ) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [isOpen, activeIndex]);

  useEffect(() => {
    const typeahead = typeaheadRef.current;
    return () => window.clearTimeout(typeahead.timer);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    // 1 文字の入力（修飾キーなし）は、その文字で始まる項目への移動として扱う
    const isPrintable =
      e.key.length === 1 &&
      e.key !== " " &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey;
    // 検索語の途中のスペースは、選択ではなく検索語の一部として扱う
    const isTypeaheadSpace = e.key === " " && typeaheadRef.current.query !== "";

    if (isPrintable || isTypeaheadSpace) {
      e.preventDefault();
      const index = findByTypeahead(e.key);
      if (!isOpen) open(index >= 0 ? index : selectedIndex);
      else if (index >= 0) moveTo(index);
      return;
    }

    if (!isOpen) {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          open();
          break;
        case "ArrowUp":
          e.preventDefault();
          open(e.altKey ? selectedIndex : 0);
          break;
        case "Home":
          e.preventDefault();
          open(0);
          break;
        case "End":
          e.preventDefault();
          open(last);
          break;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveTo(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (e.altKey) select(activeIndex);
        else moveTo(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        moveTo(0);
        break;
      case "End":
        e.preventDefault();
        moveTo(last);
        break;
      case "PageDown":
        e.preventDefault();
        moveTo(activeIndex + PAGE_SIZE);
        break;
      case "PageUp":
        e.preventDefault();
        moveTo(activeIndex - PAGE_SIZE);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        select(activeIndex);
        break;
      case "Escape":
        // keydown の既定の動作を止めると、<dialog> の Esc で閉じる動作（cancel）も起きない。
        // モーダルの中で使っても、一覧だけを閉じてモーダルは閉じないようにする
        e.preventDefault();
        close();
        break;
      case "Tab":
        // フォーカスは次の要素へ移るので、本体には戻さない
        select(activeIndex, { focus: false });
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
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? optionId(activeIndex) : undefined
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
        // 本体（combobox）を指すと選んでいる値が名前になるため、ラベルを直接指す
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={clsx(s.listbox, {
          [s._open]: isOpen,
          [s._above]: isAbove,
        })}
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
            onMouseEnter={() => moveTo(index)}
            onClick={() => select(index)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
