"use client";
import { useEffect, useRef } from "react";
import { ArcElement, Chart, DoughnutController } from "chart.js";
import clsx from "clsx";
import { readCssVar } from "./cssVar";
import s from "./CompletionDonut.module.scss";

Chart.register(ArcElement, DoughnutController);

type Props = {
  completed: number;
  todo: number;
  className?: string;
};

export function CompletionDonut({ completed, todo, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = completed + todo;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["完了タスク", "予定タスク"],
        datasets: [
          {
            // 合計 0 のときも地の灰色の輪を描く
            data: total === 0 ? [0, 1] : [completed, todo],
            backgroundColor: [
              readCssVar("--color-primary"),
              readCssVar("--color-border"),
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        events: [],
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });

    return () => chart.destroy();
  }, [completed, todo, total]);

  return (
    <div className={clsx(s.root, className)}>
      {/* 完了率は中央の文字で読み上げるため、輪は飾りとして扱う */}
      <canvas ref={canvasRef} aria-hidden />
      <span className={s.rate}>{rate}%</span>
    </div>
  );
}
