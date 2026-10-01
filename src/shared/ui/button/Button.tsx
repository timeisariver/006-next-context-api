import type { ComponentProps } from "react";
import styles from "./Button.module.scss";

type Props = ComponentProps<"button">;

export function Button({ className, ...props }: Props) {
  return (
    <button
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
