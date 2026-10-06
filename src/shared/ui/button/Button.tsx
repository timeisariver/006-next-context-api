import clsx from "clsx";
import type { ComponentProps } from "react";
import s from "./Button.module.scss";

type Props = ComponentProps<"button">;

export function Button({ className, ...props }: Props) {
  return <button className={clsx(s.Button, className)} {...props} />;
}
