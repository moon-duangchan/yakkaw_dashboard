export type ChartDataset = { label: string; data: number[] };
export type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};
export type ChartRow = Record<string, number | string>;

const isChartDataset = (value: unknown): value is ChartDataset => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { label?: unknown; data?: unknown };
  if (typeof candidate.label !== "string" || !Array.isArray(candidate.data)) return false;
  return candidate.data.every((item) => typeof item === "number");
};

export function toChartSeriesRows(chart: Partial<ChartData> | null | undefined, maxSeries = 5) {
  const labelCandidates: unknown[] = Array.isArray(chart?.labels) ? chart.labels ?? [] : [];
  const labels = labelCandidates.filter((label): label is string => typeof label === "string");
  const datasetCandidates: unknown[] = Array.isArray(chart?.datasets) ? (chart.datasets as unknown[]) : [];
  const activeDatasets = datasetCandidates.filter(isChartDataset).slice(0, maxSeries);

  const rows: ChartRow[] = [];
  labels.forEach((label, index) => {
    const row: ChartRow = { label };
    for (const ds of activeDatasets) {
      const value = ds.data[index];
      row[ds.label] = typeof value === "number" ? value : 0;
    }
    rows.push(row);
  });

  return { rows, series: activeDatasets.map((dataset) => dataset.label) };
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
