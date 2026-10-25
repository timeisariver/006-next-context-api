"use client";
import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { parseSlashDate, toDateString, toDisplay } from "@/shared/lib";
import s from "./DeadlineCell.module.scss";

type Props = {
  deadline: string;
  disabled?: boolean;
  onSave: (deadline: string) => void;
};

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
    save(parseSlashDate(draft));
  }

  return (
    <div className={s.root}>
      {isEditing ? (
        <input
          type="text"
          className={s.input}
          aria-label="期限日"
          value={draft}
          // ユーザーが編集を始めたときだけ表示する入力欄なので、そこへフォーカスを移す。
          // eslint-disable-next-line jsx-a11y/no-autofocus
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
