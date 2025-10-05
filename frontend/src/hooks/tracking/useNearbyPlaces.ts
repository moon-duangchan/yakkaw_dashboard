"use client";

import { useState } from "react";
import { haversineKm } from "@/utils/tracking";
import type { PlaceItem } from "./usePlaces";

export function useNearbyPlaces(allPlaces: PlaceItem[]) {
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceItem[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      return;
    }
    setGettingLocation(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const ranked = [...allPlaces]
          .filter((p) => isFinite(p.lat) && isFinite(p.lon))
          .map((p) => ({ ...p, _dist: haversineKm(me, { lat: p.lat, lon: p.lon }) }))
          .sort((a, b) => a._dist - b._dist)
          .slice(0, 8);
        setNearbyPlaces(ranked);
        setGettingLocation(false);
      },
      (err) => {
        setGeoError(err?.message || "Failed to get location");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return { nearbyPlaces, gettingLocation, geoError, handleUseMyLocation } as const;
}

