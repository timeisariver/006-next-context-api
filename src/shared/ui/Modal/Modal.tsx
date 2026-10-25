"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import s from "./Modal.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  className,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // showModal() の後に中身をマウントするためのフラグ。
  // 閉じた <dialog> の中では autoFocus が効かず、showModal() がフォーカスを別の要素に移すため
  const [isShown, setIsShown] = useState(false);

  // 描画前に開閉し、中身のマウントを 1 フレーム遅らせない
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    setIsShown(open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    // 背景のクリックで閉じるのはマウス向けの補助。キーボードでは Esc（dialog 標準）と閉じるボタンで閉じられる。
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={clsx(s.root, className)}
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.scroll}>
        <button
          type="button"
          className={s.close}
          aria-label="閉じる"
          onClick={onClose}
        >
          <X />
        </button>
        {/* 開くたびにマウントし直して、中身の状態を初期値に戻す */}
        {open && isShown && children}
      </div>
    </dialog>
  );
}
