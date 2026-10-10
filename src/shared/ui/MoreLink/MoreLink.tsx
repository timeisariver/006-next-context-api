import clsx from "clsx";
import s from "./MoreLink.module.scss";
import { MoveRight } from "lucide-react";
import Link from "next/link";

type Props = {
  text: string;
  href: string;
  className?: string;
};

export function MoreLink({ text, href, className }: Props) {
  return (
    <div>
      <Link href={href} className={clsx(s.root, className)}>
        <span className={s.text}>{text}</span>
        <MoveRight size={10} className={s.icon} />
      </Link>
    </div>
  );
}
