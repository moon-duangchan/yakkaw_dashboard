"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "../../utils/api";
import { getErrorMessage } from "../../utils/error";

type LastUpdateResponse = {
  aqi: number;
  timestamp: number; // milliseconds epoch
};

export const useLastUpdate = (opts?: { refreshMs?: number; province?: string }) => {
  const { refreshMs = 60_000, province } = opts || {};
  const [aqi, setAqi] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (province && province.trim()) params.province = province.trim();
      const res = await api.get<LastUpdateResponse>("/api/airquality/latest", { params });
      setAqi(res.data?.aqi ?? null);
      setTimestamp(typeof res.data?.timestamp === "number" ? res.data.timestamp : null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to fetch last update"));
    } finally {
      setLoading(false);
    }
  }, [province]);

  useEffect(() => {
    fetchLatest();
    if (!refreshMs) return;
    const id = setInterval(fetchLatest, refreshMs);
    return () => clearInterval(id);
  }, [fetchLatest, refreshMs]);

  return { aqi, timestamp, loading, error, refresh: fetchLatest };
};
