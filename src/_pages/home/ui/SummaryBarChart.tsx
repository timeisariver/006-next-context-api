"use client";
import { useEffect, useRef } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import clsx from "clsx";
import { readCssVar } from "./cssVar";
import s from "./SummaryBarChart.module.scss";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
);

type Props = {
  labels: string[];
  completed: number[];
  todo: number[];
  className?: string;
};

export function SummaryBarChart({ labels, completed, todo, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const textColor = readCssVar("--color-text-sub");
    const gridColor = readCssVar("--color-border");

    const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "完了タスク",
            data: completed,
            backgroundColor: readCssVar("--color-primary"),
          },
          {
            label: "予定タスク",
            data: todo,
            backgroundColor: readCssVar("--color-primary-light"),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: textColor },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor, precision: 0 },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, boxWidth: 12, boxHeight: 12 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, completed, todo]);

  return (
    <div className={clsx(s.root, className)}>
      <canvas ref={canvasRef} />
    </div>
  );
}
