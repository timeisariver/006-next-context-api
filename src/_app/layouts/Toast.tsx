"use client";

import clsx from "clsx";
import { useEffect, useEffectEvent } from "react";
import s from "./Toast.module.scss";

type Props = {
  message: string;
  // success は role="status"、error は role="alert"
  tone: "success" | "error";
  // 表示から 5 秒後に呼ぶ
  onDismiss: () => void;
  className?: string;
};

const DISMISS_DELAY = 5000;

export function Toast({ message, tone, onDismiss, className }: Props) {
  // onDismiss が表示のたびに作り直されても、5 秒を数え直さないようにする
  const dismiss = useEffectEvent(() => onDismiss());

  useEffect(() => {
    const timer = setTimeout(dismiss, DISMISS_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={clsx(s.root, { [s._error]: tone === "error" }, className)}
    >
      {message}
    </div>
  );
}
