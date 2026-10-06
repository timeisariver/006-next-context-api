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
    <section className={s.RecentProjects}>
      <div className={s.RecentProjects__head}>
        <DashboardHead text="最近のプロジェクト" />
        <div className={s.RecentProjects__headPlus}>
          <Plus size={18} />
        </div>
      </div>
      <div className={s.RecentProjects__content}>
        <ul className={s.RecentProjects__list}>
          <li className={s.RecentProjects__item}>
            <Link href="#" className={s.RecentProjects__itemLink}>
              <div className={s.RecentProjects__itemInfo}>
                <p className={s.RecentProjects__itemCategory}>プログラミング</p>
                <p className={s.RecentProjects__itemDate}>
                  <Calendar size={10} />
                  <time>2026/10/11</time>
                </p>
              </div>
              <p className={s.RecentProjects__itemTitle}>
                期限日までにフロントエンドエンジニアとして就職する。
              </p>
              <p className={s.RecentProjects__itemText}>
                エンジニアとしての学習習慣を身につけて生活する。
              </p>
              <div className={s.RecentProjects__itemStats}>
                <div className={s.RecentProjects__itemStat}>
                  <GitCommitHorizontal size={12} />
                  <span className={s.RecentProjects__itemStatCount}>4</span>
                </div>
                <div className={s.RecentProjects__itemStat}>
                  <FileText size={12} />
                  <span className={s.RecentProjects__itemStatCount}>4</span>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <div className={s.RecentProjects__links}>
        <MoreLink text="すべてのプロジェクトをみる" href="#" />
      </div>
    </section>
  );
}
