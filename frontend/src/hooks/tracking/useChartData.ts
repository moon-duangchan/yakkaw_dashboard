"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toChartSeriesRows, type ChartData, type ChartDataset } from "@/utils/tracking";

type Metric = "pm25" | "pm10" | "aqi";

const parseDatasets = (value: unknown): ChartDataset[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ChartDataset => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as { label?: unknown; data?: unknown };
    if (typeof candidate.label !== "string" || !Array.isArray(candidate.data)) return false;
    return candidate.data.every((entry) => typeof entry === "number");
  });
};

export function useChartData(params: {
  apiBase: string;
  range: string;
  metric: Metric;
  effectiveFilter: string;
  selectedPlaces: string[];
  refreshTick: number;
}) {
  const { apiBase, range, metric, effectiveFilter, selectedPlaces, refreshTick } = params;

  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);

  const chartCacheRef = useRef(new Map<string, { at: number; data: ChartData }>());
  const CHART_CACHE_MAX = 30;
  const CHART_TTL_MS = useMemo(() => {
    switch (range) {
      case "24 Hour":
        return 60_000;
      case "1 Week":
        return 120_000;
      case "1 Month":
        return 180_000;
      case "3 Month":
      case "1 Year":
        return 300_000;
      default:
        return 60_000;
    }
  }, [range]);

  const invalidateCache = () => chartCacheRef.current.clear();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const run = async () => {
      setLoading(true);
      try {
        const fetchOne = async (filter: string) => {
          const cacheKey = `${range}|${filter}|${metric}`;
          const rec = chartCacheRef.current.get(cacheKey);
          if (refreshTick === 0 && rec && Date.now() - rec.at < CHART_TTL_MS) return rec.data;
          const params = new URLSearchParams();
          params.set("range", range);
          params.set("metric", metric);
          if (filter) params.set("province", filter);
          const res = await fetch(`${apiBase}/api/chartdata?${params.toString()}`, { signal });
          if (!res.ok) {
            throw new Error(`Failed to fetch chart data (${res.status})`);
          }
          const json: unknown = await res.json();
          const parsed = json as { labels?: unknown; datasets?: unknown };
          const safeLabels = Array.isArray(parsed.labels)
            ? parsed.labels.filter((label): label is string => typeof label === "string")
            : [];
          const safeDatasets = parseDatasets(parsed.datasets);
          const data: ChartData = { labels: safeLabels, datasets: safeDatasets };
          chartCacheRef.current.set(cacheKey, { at: Date.now(), data });
          while (chartCacheRef.current.size > CHART_CACHE_MAX) {
            const firstKey = chartCacheRef.current.keys().next().value as string | undefined;
            if (!firstKey) break;
            chartCacheRef.current.delete(firstKey);
          }
          return data;
        };

        if (selectedPlaces.length > 0) {
          const cds = await Promise.all(selectedPlaces.map(fetchOne));
          const canonical = cds.reduce((a, b) => (b.labels.length > a.labels.length ? b : a), cds[0]);
          const union = Array.from(new Set(canonical.labels.concat(...cds.map((c) => c.labels))));
          const datasets = cds.map((c, idx) => {
            const base = new Map<string, number>();
            const d0 = c.datasets?.[0];
            (c.labels || []).forEach((lbl, i) => {
              const v = d0?.data?.[i];
              if (typeof v === "number") base.set(lbl, v);
            });
            return { label: selectedPlaces[idx], data: union.map((lbl) => base.get(lbl) ?? 0) };
          });
          setChartData({ labels: union, datasets });
        } else {
          const one = await fetchOne(effectiveFilter);
          setChartData(one);
        }
      } catch {
        // ignore abort
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [apiBase, range, metric, effectiveFilter, selectedPlaces, refreshTick, CHART_TTL_MS]);

  const { rows, series } = useMemo(
    () => toChartSeriesRows(chartData, selectedPlaces.length ? selectedPlaces.length : 3),
    [chartData, selectedPlaces.length]
  );

  return { chartData, rows, series, loading, invalidateCache } as const;
}
