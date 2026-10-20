"use client";
import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import s from "./DeadlineCell.module.scss";

type Props = {
  deadline: string;
  disabled?: boolean;
  onSave: (deadline: string) => void;
};

// "2026-10-28T12:34:56+09:00" の先頭の年-月-日だけを使う（タイムゾーン変換はしない）
function toDateString(deadline: string) {
  return deadline.slice(0, 10);
}

function toDisplay(deadline: string) {
  return toDateString(deadline).replaceAll("-", "/");
}

// "2026/11/04" を "2026-11-04" にする。日付として正しくなければ null
function parseInput(value: string) {
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export function DeadlineCell({ deadline, disabled, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  // Enter / Esc で入力欄が外れるときの blur で、確定が二重に走らないようにする
  const isClosedRef = useRef(false);

  function save(date: string | null) {
    if (date && date !== toDateString(deadline)) onSave(date);
  }

  function startEditing() {
    setDraft(toDisplay(deadline));
    isClosedRef.current = false;
    setIsEditing(true);
  }

  function commit() {
    if (isClosedRef.current) return;
    isClosedRef.current = true;
    setIsEditing(false);
    save(parseInput(draft));
  }

  return (
    <div className={s.root}>
      {isEditing ? (
        <input
          type="text"
          className={s.input}
          aria-label="期限日"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              isClosedRef.current = true;
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={s.value}
          disabled={disabled}
          onClick={startEditing}
        >
          <time dateTime={toDateString(deadline)}>{toDisplay(deadline)}</time>
        </button>
      )}
      <button
        type="button"
        className={s.picker}
        aria-label="カレンダーから期限日を選ぶ"
        disabled={disabled}
        onClick={() => dateInputRef.current?.showPicker()}
      >
        <Calendar size={14} />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        className={s.dateInput}
        tabIndex={-1}
        aria-hidden="true"
        value={toDateString(deadline)}
        onChange={(e) => save(e.target.value || null)}
      />
    </div>
  );
}
