export type ChartData = {
  labels: string[];
  datasets: { label: string; data: number[] }[];
};

export function toChartSeriesRows(chart: Partial<ChartData> | null | undefined, maxSeries = 5) {
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

export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

