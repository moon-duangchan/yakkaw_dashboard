"use client";

import { useEffect, useState } from "react";

export function useAutoRefresh(initialMs = 0) {
  const [autoRefreshMs, setAutoRefreshMs] = useState<number>(initialMs);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(() => setRefreshTick((x) => x + 1), autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs]);

  const trigger = () => setRefreshTick((x) => x + 1);

  return { autoRefreshMs, setAutoRefreshMs, refreshTick, trigger } as const;
}

