"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import s from "./Modal.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

// Radix UI の Dialog に見た目を当てたモーダル。
// 背景クリック・Esc で閉じる、背面のスクロール禁止、フォーカスの閉じ込めは Radix が受け持つ。
// 中身は閉じると外され、開くたびにマウントし直される（入力内容が初期値に戻る）。
export function Modal({ open, onClose, children, className }: Props) {
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
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type TitleProps = {
  children: React.ReactNode;
  className?: string;
};

// モーダルの見出し。モーダルの名前（aria-labelledby）になる。Modal の中でだけ使える
export function ModalTitle({ children, className }: TitleProps) {
  return <Dialog.Title className={className}>{children}</Dialog.Title>;
}
