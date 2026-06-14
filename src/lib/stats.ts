import {
  mean,
  median,
  min,
  max,
  standardDeviation,
  quantile,
  sampleCorrelation,
} from "simple-statistics";

export type ColumnType = "number" | "string" | "date" | "boolean" | "empty";

export type ColumnProfile = {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPct: number;
  distinct: number;
  topValues: { value: string; count: number }[];
  numeric?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
    p95: number;
    histogram: { bin: string; count: number }[];
  };
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

function detectType(values: unknown[]): ColumnType {
  let numbers = 0;
  let dates = 0;
  let bools = 0;
  let nonNull = 0;
  for (const v of values) {
    if (v === null || v === undefined || v === "") continue;
    nonNull++;
    if (typeof v === "boolean" || v === "true" || v === "false") {
      bools++;
      continue;
    }
    if (typeof v === "number" || (!Number.isNaN(Number(v)) && String(v).trim() !== "")) {
      numbers++;
      continue;
    }
    if (typeof v === "string" && ISO_DATE_RE.test(v)) {
      dates++;
      continue;
    }
  }
  if (!nonNull) return "empty";
  if (numbers / nonNull > 0.8) return "number";
  if (dates / nonNull > 0.7) return "date";
  if (bools / nonNull > 0.9) return "boolean";
  return "string";
}

function histogram(values: number[], bins = 10) {
  if (!values.length) return [];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (lo === hi) return [{ bin: String(lo), count: values.length }];
  const width = (hi - lo) / bins;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - lo) / width));
    counts[idx]++;
  }
  return counts.map((count, i) => {
    const a = lo + i * width;
    const b = a + width;
    return { bin: `${a.toFixed(1)}–${b.toFixed(1)}`, count };
  });
}

function topValues(values: unknown[], k = 10) {
  const counter = new Map<string, number>();
  for (const v of values) {
    if (v === null || v === undefined || v === "") continue;
    const key = String(v);
    counter.set(key, (counter.get(key) ?? 0) + 1);
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([value, count]) => ({ value, count }));
}

export function profileColumn(name: string, values: unknown[]): ColumnProfile {
  const type = detectType(values);
  const nullCount = values.filter((v) => v === null || v === undefined || v === "").length;
  const distinct = new Set(
    values.filter((v) => v !== null && v !== undefined && v !== "").map(String)
  ).size;

  const profile: ColumnProfile = {
    name,
    type,
    nullCount,
    nullPct: values.length ? (nullCount / values.length) * 100 : 0,
    distinct,
    topValues: type === "string" ? topValues(values) : [],
  };

  if (type === "number") {
    const nums: number[] = [];
    for (const v of values) {
      if (v === null || v === undefined || v === "") continue;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(n)) nums.push(n);
    }
    if (nums.length > 1) {
      profile.numeric = {
        min: min(nums),
        max: max(nums),
        mean: mean(nums),
        median: median(nums),
        std: standardDeviation(nums),
        p95: quantile(nums, 0.95),
        histogram: histogram(nums),
      };
    }
  }
  return profile;
}

export function correlationMatrix(columns: { name: string; values: number[] }[]) {
  return columns.map((row) => ({
    name: row.name,
    correlations: columns.map((col) => {
      if (row.name === col.name) return { other: col.name, r: 1 };
      const pairs: [number, number][] = [];
      for (let i = 0; i < Math.min(row.values.length, col.values.length); i++) {
        const a = row.values[i];
        const b = col.values[i];
        if (Number.isFinite(a) && Number.isFinite(b)) pairs.push([a, b]);
      }
      if (pairs.length < 3) return { other: col.name, r: 0 };
      return {
        other: col.name,
        r: sampleCorrelation(
          pairs.map((p) => p[0]),
          pairs.map((p) => p[1])
        ),
      };
    }),
  }));
}
