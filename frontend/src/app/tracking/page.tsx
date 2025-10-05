"use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PlaceSelect from "@/components/ui/PlaceSelect";
import Navbar from "@/components/ui/Navbar";
import { useLastUpdate } from "@/hooks/useLastUpdate";
import CalendarHeatmap from "@/components/ui/CalendarHeatmap";
import RangeToggle from "@/components/ui/RangeToggle";
import MetricToggle from "@/components/ui/MetricToggle";
import AutoRefreshSelect from "@/components/ui/AutoRefreshSelect";
import TrendChart from "@/components/ui/TrendChart";
import CompareChips from "@/components/ui/CompareChips";
import TrackingControls from "@/components/tracking/TrackingControls";
import { useTrackingFilters } from "@/hooks/tracking/useTrackingFilters";
import { useChartData } from "@/hooks/tracking/useChartData";
import { useHeatmapSeries } from "@/hooks/tracking/useHeatmapSeries";
import { usePlaces } from "@/hooks/tracking/usePlaces";
import { useNearbyPlaces } from "@/hooks/tracking/useNearbyPlaces";
import { useCompareLastRange } from "@/hooks/tracking/useCompareLastRange";
import { useAutoRefresh } from "@/hooks/tracking/useAutoRefresh";
// chart is rendered via <TrendChart /> component

type ChartData = {
  labels: string[];
  datasets: { label: string; data: number[] }[];
};

type OneYearSeriesItem = {
  timestamp: number;
  pm25?: number;
  pm10?: number;
  count: number;
};

const RANGES = ["Today", "24 Hour", "1 Week", "1 Month", "3 Month", "1 Year"] as const;
type RangeType = (typeof RANGES)[number];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function toChartSeriesRows(chart: Partial<ChartData> | null | undefined, maxSeries = 5) {
  // Transform to array of objects suitable for recharts; tolerate null/undefined from API
  const labels: string[] = Array.isArray(chart?.labels) ? (chart!.labels as string[]) : [];
  const datasetsRaw: any[] = Array.isArray(chart?.datasets) ? (chart!.datasets as any[]) : [];
  const activeDatasets = datasetsRaw
    .filter((ds) => ds && typeof ds.label === "string" && Array.isArray(ds.data))
    .slice(0, maxSeries);

  const rows: Array<Record<string, any>> = [];
  for (let idx = 0; idx < labels.length; idx++) {
    const row: Record<string, any> = { label: labels[idx] };
    for (const ds of activeDatasets) {
      const v = ds.data[idx];
      row[ds.label] = typeof v === "number" ? v : 0;
    }
    rows.push(row);
  }
  return { rows, series: activeDatasets.map((d) => d.label as string) };
}

export default function TrackingPage() {
  const [placeQuery, setPlaceQuery] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");

  const {
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
  } = useTrackingFilters(RANGES);

  const { allPlaces, loadingPlaces } = usePlaces({ apiBase: API_BASE, province });
  const { nearbyPlaces, gettingLocation, geoError, handleUseMyLocation } = useNearbyPlaces(allPlaces);

  // Places are provided by usePlaces hook

  // Nearby logic moved to useNearbyPlaces

  // Auto/manual refresh
  const { autoRefreshMs, setAutoRefreshMs, refreshTick, trigger: doRefresh } = useAutoRefresh(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  const handleFullRefresh = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res = await fetch(`${API_BASE}/pipeline/refresh`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const processed = typeof json?.processed === 'number' ? json.processed : undefined;
        setSyncMessage(typeof processed === 'number' ? `Synced ${processed} records` : 'Sync complete');
        setLastSyncAt(Date.now());
      } else {
        setSyncMessage(`Sync failed${json?.error ? `: ${json.error}` : ''}`);
      }
    } catch (e: any) {
      setSyncMessage(`Sync error: ${e?.message || 'unknown error'}`);
    } finally {
      // Bust caches via hooks and trigger refresh
      chartInvalidate();
      heatInvalidate();
      doRefresh();
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // local UI-only mirrors for inputs

  // Determine effective filter provided by hook

  // Last update tracker (auto-refreshes every 60s). Filters by effective filter.
  const { timestamp, aqi, loading: loadingLast } = useLastUpdate({ refreshMs: 60_000, province: effectiveFilter || selectedPlaces[0] || province || place });

  // Compute last-updated range across compared places (min..max ago)
  const compareLastRange = useCompareLastRange({ apiBase: API_BASE, selectedPlaces, refreshTick });

  const lastUpdatedText = useMemo(() => {
    if (!timestamp) return "—";
    const diffMs = Date.now() - timestamp;
    if (diffMs < 0) return new Date(timestamp).toLocaleString();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  }, [timestamp]);

  // Chart and heatmap data via hooks
  const { chartData, rows, series: lineSeries, loading: loadingChart, invalidateCache: chartInvalidate } = useChartData({
    apiBase: API_BASE,
    range,
    metric,
    effectiveFilter,
    selectedPlaces,
    refreshTick,
  });

  const { series, loading: loadingHeat, heatStart, heatEnd, invalidateCache: heatInvalidate } = useHeatmapSeries({
    apiBase: API_BASE,
    filter: heatmapFilter,
    metric,
    refreshTick,
  });

  // chart fetching moved to useChartData

  // heatmap fetching moved to useHeatmapSeries

  // rows + lineSeries from hook; heatStart/End from heat hook

  // Places available (optionally limited by province)
  const placesInProvince = useMemo(() => {
    if (!province.trim()) return allPlaces;
    const pv = province.trim().toLowerCase();
    return allPlaces.filter((p) => p.address.toLowerCase().includes(pv) || p.label.toLowerCase().includes(pv));
  }, [allPlaces, province]);

  const provincePlaceCount = placesInProvince.length;

  // storage + URL sync handled by useTrackingFilters

  const deferredPlaceQuery = useDeferredValue(placeQuery);

  // Province options from chart dataset labels (fallback from device addresses)
  const provinceOptions = useMemo(() => {
    const fromChart = Array.from(new Set(chartData.datasets.map((d) => d.label).filter(Boolean)));
    if (fromChart.length) return fromChart;
    // fallback from addresses by splitting with common pattern
    const seen = new Set<string>();
    const arr: string[] = [];
    for (const p of allPlaces) {
      const addr = (p.address || '').toString();
      let prov = '';
      if (addr.includes('จ.')) prov = addr.split('จ.')[1]?.trim() || '';
      else {
        const tokens = addr.trim().split(/\s+/);
        prov = tokens[tokens.length - 1] || '';
      }
      if (prov && !seen.has(prov)) { seen.add(prov); arr.push(prov); }
    }
    return arr;
  }, [chartData.datasets, allPlaces]);

  // Options for Search Place panel (left card)
  const placeOptionsPanel = useMemo(() => {
    const src = placesInProvince.length ? placesInProvince : allPlaces;
    const labels = Array.from(new Set(src.map((p) => p.label)));
    if (labels.length) return labels;
    // Fallback to dataset labels (often provinces) if no devices loaded
    return Array.from(new Set(chartData.datasets.map((d) => d.label).filter(Boolean)));
  }, [placesInProvince, allPlaces, chartData.datasets]);

  // Options for Heatmap target selector in compare mode
  const heatmapOptions = useMemo(() => {
    const labels = Array.from(new Set(allPlaces.map((p) => p.label)));
    if (labels.length) return labels;
    const ds = Array.from(new Set(chartData.datasets.map((d) => d.label).filter(Boolean)));
    return ds;
  }, [allPlaces, chartData.datasets]);

  return (
    <>
      <Navbar />
      <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Air Quality Tracking</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-muted-foreground">Track PM2.5 trends, search by place, and explore a 1-year calendar heatmap for daily exposure.</p>
          <div className="text-xs sm:text-sm text-slate-600 bg-slate-100 rounded-md px-2 py-1 w-fit">
            {selectedPlaces.length > 0 ? (
              <span>
                {(() => {
                  if (!compareLastRange?.min || !compareLastRange?.max) return 'Last updated: —';
                  const now = Date.now();
                  const fmt = (t: number) => { const d = now - t; const s = Math.floor(d/1000); if (s<60) return `${s}s`; const m=Math.floor(s/60); if (m<60) return `${m}m`; const h=Math.floor(m/60); if(h<24) return `${h}h`; const dd=Math.floor(h/24); return `${dd}d`; };
                  return `Last updated: ${fmt(compareLastRange.min)}–${fmt(compareLastRange.max)} ago`;
                })()}
              </span>
            ) : (
              <span>Last updated: {loadingLast ? 'loading…' : lastUpdatedText}</span>
            )}
            {typeof aqi === 'number' && selectedPlaces.length === 0 && (
              <span className="ml-2 text-slate-500">(AQI {aqi})</span>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col">
              <span>PM2.5 Trend</span>
              <span className="text-xs font-normal text-muted-foreground">
                {place ? `Filtered by place: ${place}` : province ? `Filtered by province: ${province}` : "All places"}
              </span>
            </div>
            <TrackingControls
              ranges={RANGES}
              range={range}
              onRangeChange={setRange}
              metric={metric}
              onMetricChange={setMetric}
              placeQuery={placeQuery}
              setPlaceQuery={setPlaceQuery}
              onQuickPlaceSelect={(v) => {
                const val = v.trim();
                if (!val) return;
                if (selectedPlaces.includes(val)) return;
                if (selectedPlaces.length < 3) setSelectedPlaces((a) => [...a, val]);
                else {
                  setPlace(val);
                  setPlaceQuery(val);
                }
              }}
              placeOptions={useMemo(() => {
                const labels = Array.from(new Set(allPlaces.map((p) => p.label)));
                if (labels.length) return labels;
                const ds = Array.from(new Set(chartData.datasets.map((d) => d.label).filter(Boolean)));
                return ds;
              }, [allPlaces, chartData.datasets])}
              nearby={nearbyPlaces.map((p) => p.label)}
              onUseMyLocation={handleUseMyLocation}
              gettingLocation={gettingLocation}
              loadingPlaces={loadingPlaces}
              provinceQuery={provinceQuery}
              setProvinceQuery={setProvinceQuery}
              onProvinceSelect={(v) => {
                setProvince(v.trim());
                setProvinceQuery(v.trim());
                setSelectedPlaces([]);
              }}
              provinceOptions={provinceOptions}
              province={province}
              provincePlaceCount={provincePlaceCount}
              onClearFilters={() => {
                clearFilters();
                setProvinceQuery("");
                setPlaceQuery("");
              }}
              hasFilters={Boolean(province || place || selectedPlaces.length > 0)}
              onFullRefresh={handleFullRefresh}
              syncing={syncing}
              autoRefreshMs={autoRefreshMs}
              setAutoRefreshMs={setAutoRefreshMs}
              hasPlace={Boolean(place)}
              onClearPlace={() => {
                setPlace("");
                setPlaceQuery("");
              }}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(syncMessage || lastSyncAt) && (
            <div className="mb-2 text-xs text-muted-foreground flex gap-4">
              {syncMessage && <span>{syncMessage}</span>}
              {lastSyncAt && <span>Last sync: {new Date(lastSyncAt).toLocaleString()}</span>}
            </div>
          )}
          <CompareChips
            items={selectedPlaces}
            onRemove={(p) => setSelectedPlaces((arr) => arr.filter((x) => x !== p))}
            onClear={() => setSelectedPlaces([])}
            onExport={() => {
              const headers = ['label', ...lineSeries];
              const data = [headers.join(',')].concat(rows.map((r) => headers.map((h) => r[h] ?? '').join(',')));
              const blob = new Blob([data.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `tracking_${range}_${metric}_${Date.now()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          />
          <TrendChart rows={rows} series={lineSeries} metric={metric} loading={loadingChart} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Search Place</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Type to search a place or filter by province and view the 1-year calendar heatmap of daily PM2.5 averages.</p>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Province</div>
              <PlaceSelect
                value={province}
                onChange={(v) => { setProvinceQuery(v); }}
                onSelect={(v) => { setProvince(v); setProvinceQuery(v); setSelectedPlaces([]); }}
                options={provinceOptions}
                placeholder="Select province"
                loading={loadingChart && !provinceOptions.length}
                className="w-full"
              />
              {province && (
                <div className="text-[11px] text-muted-foreground">{provincePlaceCount} places in {province}</div>
              )}
            </div>

            <PlaceSelect
              value={place}
              onChange={(v) => { setPlaceQuery(v); }}
              onSelect={(v) => { setPlace(v); setPlaceQuery(v); setSelectedPlaces([]); }}
              options={placeOptionsPanel}
              nearby={nearbyPlaces.map((p) => p.label)}
              onUseMyLocation={handleUseMyLocation}
              gettingLocation={gettingLocation}
              loading={loadingPlaces}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleUseMyLocation} disabled={gettingLocation}>
                {gettingLocation ? 'Locating…' : 'Use my location'}
              </Button>
              {geoError && <span className="text-xs text-destructive">{geoError}</span>}
            </div>
            {province && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Places in {province}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
                    onClick={() => { setPlace(""); setPlaceQuery(""); setSelectedPlaces([]); }}
                    title={`All places in ${province}`}
                  >
                    All in {province}
                  </button>
                  {(placesInProvince.length ? placesInProvince : allPlaces).slice(0, 20).map((p) => (
                    <button
                      key={`${p.label}-${p.address}`}
                      className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
                      onClick={() => { setPlace(p.label); setPlaceQuery(p.label); setSelectedPlaces([]); }}
                      title={p.address}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!province && nearbyPlaces.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Nearby</div>
                <div className="flex flex-wrap gap-2">
                  {nearbyPlaces.slice(0, 6).map((p) => (
                    <button
                      key={`${p.label}-${p.address}`}
                      className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
                      onClick={() => { setPlace(p.label); setPlaceQuery(p.label); setSelectedPlaces([]); }}
                      title={p.address}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Separator />
            <div className="text-xs text-muted-foreground leading-relaxed">
              Tips
              <ul className="mt-1 list-disc pl-4">
                <li>Use place search above to refine the trend chart.</li>
                <li>Pick a place here to render the heatmap below.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Calendar Heatmap {heatmapFilter ? `— ${heatmapFilter}` : ""}</span>
              {selectedPlaces.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Show heatmap for:</span>
                  <PlaceSelect
                    value={heatmapTarget}
                    onChange={(v) => setHeatmapTarget(v)}
                    onSelect={(v) => setHeatmapTarget(v)}
                    options={heatmapOptions}
                    className="w-56"
                    placeholder="Pick a place"
                  />
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {loadingHeat ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading heatmap…</div>
              ) : heatmapFilter ? (
                <CalendarHeatmap
                  start={heatStart}
                  end={heatEnd}
                  data={series}
                  title={`Daily ${metric.toUpperCase()} (last 12 months)`}
                  metric={metric}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Choose a place or province to render the heatmap</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
