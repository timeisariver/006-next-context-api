import s from "./RecentProjects.module.scss";
import {
  Calendar,
  Plus,
  GitCommitHorizontal,
  FileText,
  MoveRight,
} from "lucide-react";
import Link from "next/link";
import { DashboardHead } from "@/shared/ui/DashboardHead/DashboardHead";
import { MoreLink } from "@/shared/ui/MoreLink/MoreLink";

export function RecentProjects() {
  return (
    <section className={s.root}>
      <div className={s.head}>
        <DashboardHead text="最近のプロジェクト" />
        <div className={s.plus}>
          <Plus size={18} />
        </div>
      </div>
      <div className={s.content}>
        <ul className={s.list}>
          <li className={s.item}>
            <Link href="#" className={s.link}>
              <div className={s.info}>
                <p className={s.category}>プログラミング</p>
                <p className={s.date}>
                  <Calendar size={10} />
                  <time>2026/10/11</time>
                </p>
              </div>
              <p className={s.title}>
                期限日までにフロントエンドエンジニアとして就職する。
              </p>
              <p className={s.text}>
                エンジニアとしての学習習慣を身につけて生活する。
              </p>
              <div className={s.stats}>
                <div className={s.stat}>
                  <GitCommitHorizontal size={12} />
                  <span className={s.statCount}>4</span>
                </div>
                <div className={s.stat}>
                  <FileText size={12} />
                  <span className={s.statCount}>4</span>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <div className={s.links}>
        <MoreLink text="すべてのプロジェクトをみる" href="#" />
      </div>
    </section>
  );
}
