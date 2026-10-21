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
            data: completed + todo === 0 ? [0, 1] : [completed, todo],
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
  }, [completed, todo]);

  return (
    <div className={clsx(s.root, className)}>
      <canvas ref={canvasRef} />
    </div>
  );
}
