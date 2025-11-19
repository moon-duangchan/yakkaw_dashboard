"use client";

import { useEffect, useState } from "react";

export type PlaceItem = { label: string; place: string; address: string; lat: number; lon: number };

export function usePlaces(params: { apiBase: string; province: string }) {
  const { apiBase, province } = params;
  const [allPlaces, setAllPlaces] = useState<PlaceItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const run = async () => {
      setLoadingPlaces(true);
      try {
        const url = `${apiBase}/places${province ? `?province=${encodeURIComponent(province)}` : ""}`;
        const res = await fetch(url, { signal });
        if (!res.ok) {
          throw new Error(`Failed to fetch places (${res.status})`);
        }
        const json: unknown = await res.json();
        const items = Array.isArray(json) ? json : [];
        const acc: PlaceItem[] = [];
        const seen = new Set<string>();
        for (const raw of items) {
          if (!raw || typeof raw !== "object") continue;
          const record = raw as Record<string, unknown>;
          const label = (record.label ?? record.place ?? record.address ?? "").toString().trim();
          const address = (record.address ?? "").toString().trim();
          const lat = Number(record.latitude ?? record.lat ?? record.Latitude);
          const lon = Number(record.longitude ?? record.lon ?? record.Longitude);
          if (!label) continue;
          const key = `${label}|${address}`;
          if (seen.has(key)) continue;
          seen.add(key);
          acc.push({ label, address, place: label, lat: isFinite(lat) ? lat : 0, lon: isFinite(lon) ? lon : 0 });
        }
        setAllPlaces(acc);
      } catch {
        setAllPlaces([]);
      } finally {
        setLoadingPlaces(false);
      }
    };
    run();
    return () => controller.abort();
  }, [apiBase, province]);

  return { allPlaces, loadingPlaces } as const;
}
