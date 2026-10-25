"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Calendar, ChevronDown } from "lucide-react";
import { getStats, type Stats } from "@/shared/api";
import { formatDate } from "@/shared/lib";
import { DashboardHead } from "@/shared/ui";
import { CompletionDonut } from "./CompletionDonut";
import { SummaryBarChart } from "./SummaryBarChart";
import { WeekOverWeek } from "./WeekOverWeek";
import s from "./Summary.module.scss";

type Props = {
  className?: string;
};

// TODO: 前週のデータが API にないため固定値（見た目のみ）
const WEEK_OVER_WEEK = { completed: 44, todo: 36, rate: 8 };

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function Summary({ className }: Props) {
  const [stats, setStats] = useState<Stats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setStats(await getStats());
      } catch {
        setError("進捗の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const completedSeries = stats.find((item) => item.type === "completed");
  const todoSeries = stats.find((item) => item.type === "todo");
  const dates = (completedSeries ?? todoSeries)?.data ?? [];
  const completed = dates.map((_, i) => completedSeries?.data[i]?.value ?? 0);
  const todo = dates.map((_, i) => todoSeries?.data[i]?.value ?? 0);
  const labels = dates.map((item) => formatDate(item.date, "M / DD"));

  const completedTotal = sum(completed);
  const todoTotal = sum(todo);

  return (
    <section className={clsx(s.root, className)}>
      <div className={s.head}>
        <DashboardHead text="進捗サマリー" />
        {/* TODO: 期間の切り替えは未実装（見た目のみ） */}
        <button type="button" className={s.period}>
          週
          <ChevronDown size={16} />
        </button>
      </div>
      {isLoading ? (
        <p className={s.message}>読み込み中…</p>
      ) : error ? (
        <p className={s.message}>{error}</p>
      ) : dates.length === 0 ? (
        <p className={s.message}>データがありません</p>
      ) : (
        <>
          <div className={s.meta}>
            <ul className={s.legend}>
              <li className={s.legendItem}>
                <span className={clsx(s.swatch, s._completed)} />
                完了タスク
              </li>
              <li className={s.legendItem}>
                <span className={clsx(s.swatch, s._todo)} />
                予定タスク
              </li>
            </ul>
            <div className={s.range}>
              <Calendar size={16} className={s.calendar} aria-hidden />
              {formatDate(dates[0].date, "YYYY-MM-DD")}
              <span>~</span>
              <Calendar size={16} className={s.calendar} aria-hidden />
              {formatDate(dates[dates.length - 1].date, "YYYY-MM-DD")}
            </div>
          </div>
          <SummaryBarChart labels={labels} completed={completed} todo={todo} />
          <div className={s.cards}>
            <div className={s.card}>
              <p className={s.cardLabel}>完了タスク</p>
              <div className={s.cardBody}>
                <p className={s.cardValue}>{completedTotal}</p>
                <WeekOverWeek value={WEEK_OVER_WEEK.completed} />
              </div>
            </div>
            <div className={s.card}>
              <p className={s.cardLabel}>予定タスク</p>
              <div className={s.cardBody}>
                <p className={s.cardValue}>{todoTotal}</p>
                <WeekOverWeek value={WEEK_OVER_WEEK.todo} />
              </div>
            </div>
            <div className={s.card}>
              <p className={s.cardLabel}>完了率</p>
              <div className={clsx(s.cardBody, s._rate)}>
                <CompletionDonut completed={completedTotal} todo={todoTotal} />
                <WeekOverWeek value={WEEK_OVER_WEEK.rate} />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
