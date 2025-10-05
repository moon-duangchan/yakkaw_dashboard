"use client";

import RangeToggle from "@/components/ui/RangeToggle";
import MetricToggle from "@/components/ui/MetricToggle";
import PlaceSelect from "@/components/ui/PlaceSelect";
import AutoRefreshSelect from "@/components/ui/AutoRefreshSelect";
import { Button } from "@/components/ui/button";

type Metric = "pm25" | "pm10" | "aqi";

type Props = {
  ranges: readonly string[];
  range: string;
  onRangeChange: (v: string) => void;
  metric: Metric;
  onMetricChange: (m: Metric) => void;
  placeQuery: string;
  setPlaceQuery: (v: string) => void;
  onQuickPlaceSelect: (val: string) => void;
  placeOptions: string[];
  nearby: string[];
  onUseMyLocation: () => void;
  gettingLocation: boolean;
  loadingPlaces: boolean;
  provinceQuery: string;
  setProvinceQuery: (v: string) => void;
  onProvinceSelect: (v: string) => void;
  provinceOptions: string[];
  province: string;
  provincePlaceCount: number;
  onClearFilters: () => void;
  hasFilters: boolean;
  onFullRefresh: () => void;
  syncing: boolean;
  autoRefreshMs: number;
  setAutoRefreshMs: (ms: number) => void;
  hasPlace: boolean;
  onClearPlace: () => void;
};

export default function TrackingControls(props: Props) {
  const {
    ranges,
    range,
    onRangeChange,
    metric,
    onMetricChange,
    placeQuery,
    setPlaceQuery,
    onQuickPlaceSelect,
    placeOptions,
    nearby,
    onUseMyLocation,
    gettingLocation,
    loadingPlaces,
    provinceQuery,
    setProvinceQuery,
    onProvinceSelect,
    provinceOptions,
    province,
    provincePlaceCount,
    onClearFilters,
    hasFilters,
    onFullRefresh,
    syncing,
    autoRefreshMs,
    setAutoRefreshMs,
    hasPlace,
    onClearPlace,
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RangeToggle value={range} options={ranges} onChange={onRangeChange} />

      <MetricToggle value={metric} onChange={onMetricChange} />

      <PlaceSelect
        value={placeQuery}
        onChange={(v) => setPlaceQuery(v)}
        onSelect={(v) => onQuickPlaceSelect(v)}
        options={placeOptions}
        nearby={nearby}
        onUseMyLocation={onUseMyLocation}
        gettingLocation={gettingLocation}
        loading={loadingPlaces}
        className="w-56"
      />

      <PlaceSelect
        value={provinceQuery}
        onChange={(v) => setProvinceQuery(v)}
        onSelect={(v) => onProvinceSelect(v.trim())}
        options={provinceOptions}
        placeholder="Filter by province"
        loading={false}
        className="w-56"
      />
      {province && (
        <span className="text-[11px] px-2 py-1 rounded bg-muted text-muted-foreground">{provincePlaceCount} places</span>
      )}

      {hasFilters && (
        <Button size="sm" variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}

      <Button size="sm" variant="outline" onClick={onFullRefresh} disabled={syncing}>
        {syncing ? "Refreshing…" : "Sync & Refresh"}
      </Button>

      <AutoRefreshSelect value={autoRefreshMs} onChange={setAutoRefreshMs} />

      {hasPlace && (
        <Button variant="ghost" size="sm" onClick={onClearPlace}>
          Clear place
        </Button>
      )}
    </div>
  );
}

