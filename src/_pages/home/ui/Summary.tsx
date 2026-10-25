"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import { Calendar, ChevronDown } from "lucide-react";
import { getStats, type Stats } from "@/shared/api";
import { DashboardHead } from "@/shared/ui";
import { CompletionDonut } from "./CompletionDonut";
import { SummaryBarChart } from "./SummaryBarChart";
import s from "./Summary.module.scss";

type Props = {
  className?: string;
};

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
  const labels = dates.map((item) => dayjs(item.date).format("M / DD"));

  const completedTotal = sum(completed);
  const todoTotal = sum(todo);
  const total = completedTotal + todoTotal;
  const rate = total === 0 ? 0 : Math.round((completedTotal / total) * 100);

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
              {dayjs(dates[0].date).format("YYYY-MM-DD")}
              <span>~</span>
              <Calendar size={16} className={s.calendar} aria-hidden />
              {dayjs(dates[dates.length - 1].date).format("YYYY-MM-DD")}
            </div>
          </div>
          <SummaryBarChart labels={labels} completed={completed} todo={todo} />
          <div className={s.cards}>
            <div className={s.card}>
              <p className={s.cardLabel}>完了タスク</p>
              <p className={s.cardValue}>{completedTotal}</p>
            </div>
            <div className={s.card}>
              <p className={s.cardLabel}>予定タスク</p>
              <p className={s.cardValue}>{todoTotal}</p>
            </div>
            <div className={clsx(s.card, s._rate)}>
              <div>
                <p className={s.cardLabel}>完了率</p>
                <p className={s.cardValue}>{rate}%</p>
              </div>
              <CompletionDonut completed={completedTotal} todo={todoTotal} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
