"use client";

import { useEffect, useState } from "react";

export function useCompareLastRange(params: { apiBase: string; selectedPlaces: string[]; refreshTick: number }) {
  const { apiBase, selectedPlaces, refreshTick } = params;
  const [compareLastRange, setCompareLastRange] = useState<{ min?: number; max?: number } | null>(null);

  useEffect(() => {
    let aborted = false;
    const run = async () => {
      if (selectedPlaces.length === 0) {
        setCompareLastRange(null);
        return;
      }
      try {
        const results: number[] = [];
        await Promise.all(
          selectedPlaces.map(async (p) => {
            const res = await fetch(`${apiBase}/api/airquality/latest?province=${encodeURIComponent(p)}`);
            if (!res.ok) return;
            const json = await res.json();
            if (typeof json?.timestamp === "number") results.push(json.timestamp);
          })
        );
        if (aborted) return;
        if (results.length === 0) {
          setCompareLastRange(null);
          return;
        }
        setCompareLastRange({ min: Math.min(...results), max: Math.max(...results) });
      } catch {
        if (!aborted) setCompareLastRange(null);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [apiBase, selectedPlaces, refreshTick]);

  return compareLastRange;
}

