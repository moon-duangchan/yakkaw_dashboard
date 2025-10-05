"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Metric = "pm25" | "pm10" | "aqi";

export function useTrackingFilters(allowedRanges: readonly string[], defaults?: { range?: string; metric?: Metric }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [range, setRange] = useState<string>(defaults?.range ?? "24 Hour");
  const [metric, setMetric] = useState<Metric>(defaults?.metric ?? "pm25");
  const [place, setPlace] = useState("");
  const [province, setProvince] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [heatmapTarget, setHeatmapTarget] = useState<string>("");

  // Initialize from URL or localStorage on mount
  useEffect(() => {
    const r = searchParams.get("range");
    if (r && allowedRanges.includes(r)) setRange(r);
    const m = searchParams.get("metric");
    if (m && (["pm25", "pm10", "aqi"] as const).includes(m as any)) setMetric(m as Metric);
    const pv = searchParams.get("province") || "";
    const pl = searchParams.get("place") || "";
    if (pv) setProvince(pv);
    if (pl) setPlace(pl);
    const cmp = searchParams.get("places");
    if (cmp) setSelectedPlaces(cmp.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3));
    const ht = searchParams.get("heatmap") || "";
    if (ht) setHeatmapTarget(ht);

    try {
      if (!pv) {
        const savedProv = localStorage.getItem("tracking:province") || "";
        if (savedProv) setProvince(savedProv);
      }
      if (!pl) {
        const savedPlace = localStorage.getItem("tracking:place") || "";
        if (savedPlace) setPlace(savedPlace);
      }
      const savedRange = localStorage.getItem("tracking:range");
      if (savedRange && allowedRanges.includes(savedRange)) setRange(savedRange);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push to URL when key fields change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("range", range);
    params.set("metric", metric);
    if (province) params.set("province", province);
    if (place) params.set("place", place);
    if (selectedPlaces.length) params.set("places", selectedPlaces.join(","));
    if (heatmapTarget) params.set("heatmap", heatmapTarget);
    const qs = params.toString();
    router.replace(`/tracking${qs ? `?${qs}` : ""}`);
  }, [router, range, metric, province, place, selectedPlaces, heatmapTarget]);

  // Persist in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tracking:range", range);
    } catch {}
  }, [range]);
  useEffect(() => {
    try {
      if (place) localStorage.setItem("tracking:place", place);
      else localStorage.removeItem("tracking:place");
    } catch {}
  }, [place]);
  useEffect(() => {
    try {
      if (province) localStorage.setItem("tracking:province", province);
      else localStorage.removeItem("tracking:province");
    } catch {}
  }, [province]);

  const effectiveFilter = useMemo(() => {
    if (selectedPlaces.length > 0) return "";
    const p = place.trim();
    if (p) return p;
    const pv = province.trim();
    if (pv) return pv;
    return "";
  }, [place, province, selectedPlaces.length]);

  const heatmapFilter = useMemo(() => {
    const t = heatmapTarget.trim();
    if (t) return t;
    if (selectedPlaces.length > 0) return selectedPlaces[0];
    const p = place.trim();
    if (p) return p;
    const pv = province.trim();
    if (pv) return pv;
    return "";
  }, [heatmapTarget, selectedPlaces, place, province]);

  const clearFilters = () => {
    setProvince("");
    setPlace("");
    setSelectedPlaces([]);
    setHeatmapTarget("");
  };

  return {
    range,
    setRange,
    metric,
    setMetric,
    place,
    setPlace,
    province,
    setProvince,
    selectedPlaces,
    setSelectedPlaces,
    effectiveFilter,
    heatmapTarget,
    setHeatmapTarget,
    heatmapFilter,
    clearFilters,
  } as const;
}
