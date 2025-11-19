"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import Chart from "chart.js/auto";
import type { Chart as ChartJS, ChartConfiguration, ChartDataset, ChartOptions, ScriptableContext, TooltipItem } from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
// Explicitly register the matrix controller/element so Chart.js recognizes the "matrix" type
Chart.register(MatrixController, MatrixElement);

type CalendarHeatmapProps = {
  start: Date;
  end: Date;
  data: Array<{ timestamp: number; pm25?: number; count?: number }>;
  title?: string;
  className?: string;
  showWeekdayLabels?: boolean;
  metric?: "pm25" | "pm10" | "aqi";
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type MatrixPoint = { x: number; y: number; v?: number; t: number };

export default function CalendarHeatmap({ start, end, data, title, className, showWeekdayLabels = true, metric = "pm25" }: CalendarHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"matrix"> | null>(null);

  // Map of day(ms) -> value
  const valueMap = useMemo(() => {
    const m = new Map<number, number | undefined>();
    for (const item of data) {
      const day = startOfDay(new Date(item.timestamp)).getTime();
      const val = item.pm25; // backend provides selected metric value under pm25 slot
      if (!m.has(day)) m.set(day, val);
    }
    return m;
  }, [data]);

  // Build continuous days and layout params
  const layout = useMemo(() => {
    const s = startOfDay(start);
    const e = startOfDay(end);
    const days: { date: Date; v: number | undefined }[] = [];
    for (let d = new Date(s); d <= e; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      const key = startOfDay(d).getTime();
      const v = valueMap.get(key);
      days.push({ date: new Date(key), v });
    }
    const offset = s.getDay();
    const totalWeeks = Math.ceil((offset + days.length) / 7);
    // Precompute month label per week column (top axis)
    const monthLabels: Record<number, string> = {};
    const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let lastMonth = -1;
    for (let col = 0; col < totalWeeks; col++) {
      // date represented by first day shown in this column
      const dayIndex = col * 7 - offset; // day offset from start
      const d = new Date(s.getFullYear(), s.getMonth(), s.getDate() + dayIndex);
      const m = d.getMonth();
      // show label at month change boundaries and near the start of month
      if (m !== lastMonth && d.getDate() <= 7) {
        monthLabels[col] = monthShort[m];
        lastMonth = m;
      } else {
        monthLabels[col] = "";
      }
    }
    return { days, offset, totalWeeks, monthLabels };
  }, [start, end, valueMap]);

  // Colors
  const colorScale = useMemo(() => {
    // Tailwind palette hex
    const colors = ["#86efac", "#a3e635", "#facc15", "#f97316", "#ef4444"]; // emerald-300, lime-400, yellow-400, orange-500, red-600
    if (metric === "pm25") {
      return (v?: number) => {
        if (v === undefined || Number.isNaN(v)) return "#e5e7eb"; // slate-200
        if (v <= 12) return colors[0];
        if (v <= 35) return colors[1];
        if (v <= 55) return colors[2];
        if (v <= 150) return colors[3];
        return colors[4];
      };
    }
    // dynamic 5-step scale based on min->max
    const vals = layout.days.map(d => d.v).filter((x): x is number => typeof x === 'number' && !Number.isNaN(x));
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 1;
    const span = Math.max(1, max - min);
    const thresholds = [0.2, 0.4, 0.6, 0.8, 1].map(r => min + r * span);
    return (v?: number) => {
      if (v === undefined || Number.isNaN(v)) return "#e5e7eb";
      for (let i = 0; i < thresholds.length; i++) {
        if (v <= thresholds[i]) return colors[i];
      }
      return colors[colors.length - 1];
    };
  }, [metric, layout.days]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Prepare matrix points
    const points: MatrixPoint[] = [];
    const { days, offset } = layout;
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      const dow = new Date(d.date).getDay(); // 0..6
      const col = Math.floor((offset + i) / 7);
      points.push({ x: col, y: dow, v: d.v, t: d.date.getTime() });
    }

    // Destroy previous
    chartRef.current?.destroy();

    const dataset: ChartDataset<"matrix", MatrixPoint[]> = {
      label: "Heatmap",
      data: points,
      parsing: { xAxisKey: "x", yAxisKey: "y" },
      width: (context: ScriptableContext<"matrix">) => {
        const area = context.chart.chartArea;
        if (!area) return 12;
        return Math.max(8, Math.floor(area.width / Math.max(1, layout.totalWeeks)) - 4);
      },
      height: (context: ScriptableContext<"matrix">) => {
        const area = context.chart.chartArea;
        if (!area) return 12;
        return Math.max(8, Math.floor(area.height / 7) - 4);
      },
      backgroundColor: (context: ScriptableContext<"matrix">) => {
        const raw = context.raw as MatrixPoint | undefined;
        return colorScale(raw?.v);
      },
      borderWidth: 0,
      hoverBackgroundColor: (context: ScriptableContext<"matrix">) => {
        const raw = context.raw as MatrixPoint | undefined;
        return colorScale(raw?.v);
      },
    };

    const options: ChartOptions<"matrix"> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<"matrix">[]) => {
              const raw = items?.[0]?.raw as MatrixPoint | undefined;
              if (!raw) return "";
              return new Date(raw.t).toDateString();
            },
            label: (item: TooltipItem<"matrix">) => {
              const raw = item.raw as MatrixPoint | undefined;
              const value = raw?.v;
              return value === undefined || Number.isNaN(value) ? "No data" : `${metric.toUpperCase()} ${value.toFixed(1)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "top",
          min: -0.5,
          max: Math.max(0, layout.totalWeeks - 0.5),
          grid: { display: false },
          ticks: {
            stepSize: 1,
            callback: (value) => {
              const idx = typeof value === "number" ? value : Number(value);
              return layout.monthLabels[Math.round(idx)] || "";
            },
            maxRotation: 0,
            autoSkip: false,
          },
        },
        y: {
          type: "linear",
          min: -0.5,
          max: 6.5,
          display: showWeekdayLabels,
          grid: { display: false },
          ticks: {
            stepSize: 1,
            callback: (value) => {
              const idx = typeof value === "number" ? value : Number(value);
              return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][Math.round(idx)] || "";
            },
          },
        },
      },
    };

    const config: ChartConfiguration<"matrix", MatrixPoint[]> = {
      type: "matrix",
      data: {
        datasets: [dataset],
      },
      options,
    };

    const chart = new Chart(ctx, config);
    chartRef.current = chart;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [layout, colorScale, metric, showWeekdayLabels]);

  return (
    <div className={cn("w-full", className)}>
      {title ? (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="mr-1">{metric.toUpperCase()}</span>
            <span>Low</span>
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#86efac" }} />
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#a3e635" }} />
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#facc15" }} />
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#f97316" }} />
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
            <span>High</span>
          </div>
        </div>
      ) : null}

      <div className="relative" style={{ height: 220 }}>
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{start.toLocaleDateString()}</span>
        <span>{end.toLocaleDateString()}</span>
      </div>
    </div>
  );
}
