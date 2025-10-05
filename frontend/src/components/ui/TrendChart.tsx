"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Metric = "pm25" | "pm10" | "aqi";

type Props = {
  rows: Array<Record<string, any>>;
  series: string[];
  metric: Metric;
  loading?: boolean;
};

export default function TrendChart({ rows, series, metric, loading }: Props) {
  return (
    <div className="h-[360px] w-full">
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
      ) : rows.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 24, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} />
            <Tooltip formatter={(v: any) => (typeof v === "number" ? v.toFixed(2) : v)} />
            <Legend />
            {metric === "pm25" && (
              <>
                <ReferenceLine y={12} stroke="#10b981" strokeDasharray="3 3" ifOverflow="extendDomain" />
                <ReferenceLine y={35} stroke="#84cc16" strokeDasharray="3 3" ifOverflow="extendDomain" />
                <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="3 3" ifOverflow="extendDomain" />
                <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="3 3" ifOverflow="extendDomain" />
              </>
            )}
            {series.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#059669"][i % 6]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

