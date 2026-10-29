import { AirQualityRecord, WeatherRecord } from './types';

export interface SummaryStatistics {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
}

export function computeSummaryStats(values: number[]): SummaryStatistics {
  if (values.length === 0) {
    return { count: 0, mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
  }

  const count = values.length;
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = Math.round((sum / count) * 100) / 100;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;

  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return { count, mean, median, stdDev, min, max };
}

export function computePearsonCorrelation(xVals: number[], yVals: number[]): {
  r: number;
  slope: number;
  intercept: number;
  count: number;
} {
  const n = Math.min(xVals.length, yVals.length);
  if (n < 2) return { r: 0, slope: 0, intercept: 0, count: n };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = xVals[i];
    const y = yVals[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  const r = denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 1000;
  const denomSlope = n * sumX2 - sumX * sumX;
  const slope = denomSlope === 0 ? 0 : Math.round((numerator / denomSlope) * 1000) / 1000;
  const intercept = Math.round(((sumY - slope * sumX) / n) * 100) / 100;

  return { r, slope, intercept, count: n };
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  label: string;
  count: number;
}

export function computeHistogram(values: number[], binCount = 12): HistogramBin[] {
  if (values.length === 0) return [];

  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));
  const binWidth = Math.max(1, (max - min) / binCount);

  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const bStart = Math.round((min + i * binWidth) * 10) / 10;
    const bEnd = Math.round((min + (i + 1) * binWidth) * 10) / 10;
    bins.push({
      binStart: bStart,
      binEnd: bEnd,
      label: `${bStart}–${bEnd}`,
      count: 0
    });
  }

  for (const v of values) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  }

  return bins;
}

export function downloadCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      const val = row[h];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
