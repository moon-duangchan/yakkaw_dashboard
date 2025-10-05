"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type OneYearSeriesItem = {
  timestamp: number;
  pm25?: number;
  count?: number;
};

type Metric = "pm25" | "pm10" | "aqi";

export function useHeatmapSeries(params: {
  apiBase: string;
  filter: string; // place or province
  metric: Metric;
  refreshTick: number;
}) {
  const { apiBase, filter, metric, refreshTick } = params;

  const [series, setSeries] = useState<OneYearSeriesItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cacheRef = useRef(new Map<string, { at: number; data: OneYearSeriesItem[] }>());
  const CACHE_MAX = 30;
  const TTL_MS = 30_000;

  const invalidateCache = () => cacheRef.current.clear();

  const heatStart = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, []);
  const heatEnd = useMemo(() => new Date(), []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const run = async () => {
      if (!filter) {
        setSeries([]);
        return;
      }
      setLoading(true);
      try {
        const cacheKey = `heat|${filter}|${metric}`;
        if (refreshTick === 0) {
          const rec = cacheRef.current.get(cacheKey);
          if (rec && Date.now() - rec.at < TTL_MS) {
            setSeries(rec.data);
            setLoading(false);
            return;
          }
        }
        const url = `${apiBase}/api/chartdata/heatmap_one_year?province=${encodeURIComponent(filter)}&metric=${encodeURIComponent(metric)}`;
        const res = await fetch(url, { signal });
        const json: any = await res.json();
        const values = json?.datasets?.[0]?.data || [];
        const items: OneYearSeriesItem[] = (json?.labels || []).map((label: string, i: number) => ({
          timestamp: new Date(label).getTime(),
          pm25: typeof values[i] === "number" ? values[i] : undefined,
          count: 1,
        }));
        setSeries(items);
        cacheRef.current.set(cacheKey, { at: Date.now(), data: items });
        while (cacheRef.current.size > CACHE_MAX) {
          const firstKey = cacheRef.current.keys().next().value as string | undefined;
          if (!firstKey) break;
          cacheRef.current.delete(firstKey);
        }
      } catch {
        // ignore abort
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [apiBase, filter, metric, refreshTick]);

  return { series, loading, heatStart, heatEnd, invalidateCache } as const;
}

