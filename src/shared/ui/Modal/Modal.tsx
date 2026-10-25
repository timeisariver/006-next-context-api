"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import s from "./Modal.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  // 見出し。モーダルの名前（aria-labelledby）にもなる
  title: string;
  children: React.ReactNode;
  className?: string;
};

// Radix UI の Dialog に見た目を当てたモーダル。
// 背景クリック・Esc で閉じる、背面のスクロール禁止、フォーカスの閉じ込めは Radix が受け持つ。
// 中身は閉じると外され、開くたびにマウントし直される（入力内容が初期値に戻る）。
export function Modal({ open, onClose, title, children, className }: Props) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />
        {/* 説明文（Dialog.Description）は置かないので、aria-describedby を外す */}
        <Dialog.Content
          className={clsx(s.root, className)}
          aria-describedby={undefined}
        >
          <div className={s.scroll}>
            <Dialog.Close className={s.close} aria-label="閉じる">
              <X />
            </Dialog.Close>
            <div className={s.body}>
              <Dialog.Title className={s.title}>{title}</Dialog.Title>
              {children}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
