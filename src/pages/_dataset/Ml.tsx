import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { kmeans } from "ml-kmeans";
import { PCA } from "ml-pca";
import * as Slider from "@radix-ui/react-slider";
import { Card, CardBody, CardHeader } from "../../ui/card";
import { KPI } from "../../ui/kpi";
import { Skeleton, SkeletonChart } from "../../ui/skeleton";
import { EmptyState } from "../../ui/empty-state";
import { formatNumber } from "../../lib/format";
import type { DatasetDetail } from "../../api/types";

const MAX_ROWS = 1500;
const CLUSTER_COLORS = [
  "var(--color-viz-2)",
  "var(--color-viz-3)",
  "var(--color-viz-4)",
  "var(--color-viz-5)",
  "var(--color-viz-1)",
  "var(--color-viz-6)",
  "#0ea5e9",
  "#84cc16",
];

function pickNumericMatrix(rows: Record<string, unknown>[]) {
  if (!rows.length) return { matrix: [] as number[][], columns: [] as string[] };
  const cols = Object.keys(rows[0]);
  const numericCols: string[] = [];
  for (const c of cols) {
    let count = 0;
    for (const r of rows) {
      const v = r[c];
      if (v === null || v === undefined || v === "") continue;
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n)) count++;
    }
    if (count / rows.length > 0.7) numericCols.push(c);
  }
  const matrix: number[][] = [];
  for (const r of rows) {
    const vec: number[] = [];
    let ok = true;
    for (const c of numericCols) {
      const v = r[c];
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) {
        ok = false;
        break;
      }
      vec.push(n);
    }
    if (ok) matrix.push(vec);
  }
  return { matrix, columns: numericCols };
}

function standardize(matrix: number[][]) {
  if (!matrix.length) return matrix;
  const cols = matrix[0].length;
  const means: number[] = Array(cols).fill(0);
  const stds: number[] = Array(cols).fill(0);
  for (let c = 0; c < cols; c++) {
    for (const row of matrix) means[c] += row[c];
    means[c] /= matrix.length;
  }
  for (let c = 0; c < cols; c++) {
    for (const row of matrix) stds[c] += (row[c] - means[c]) ** 2;
    stds[c] = Math.sqrt(stds[c] / matrix.length) || 1;
  }
  return matrix.map((row) => row.map((v, c) => (v - means[c]) / stds[c]));
}

function narrate(centroids: number[][], columns: string[]): string {
  if (!centroids.length) return "No hay clusters para describir.";
  const dimNames = columns;
  const summaries = centroids.map((centroid, i) => {
    const sorted = centroid
      .map((v, idx) => ({ v, idx }))
      .sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    const top = sorted[0];
    if (!top || dimNames.length === 0) return `Grupo ${i} sin características distintivas.`;
    const dir = top.v > 0 ? "alto" : "bajo";
    return `Grupo ${i}: ${dir} en ${dimNames[top.idx]}`;
  });
  return summaries.join(" · ");
}

export function DatasetMl({ data }: { data: DatasetDetail }) {
  const csvResource = useMemo(
    () =>
      data.resources.find((r) => {
        const f = (r.format || "").toLowerCase();
        return (f === "csv" || f === "txt") && r.download_url;
      }) ?? null,
    [data]
  );

  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [k, setK] = useState(4);

  useEffect(() => {
    setRows(null);
    setParseError(null);
    if (!csvResource || !csvResource.download_url) return;
    setParsing(true);
    Papa.parse(csvResource.download_url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      preview: MAX_ROWS,
      dynamicTyping: true,
      complete: (result) => {
        setRows(result.data as Record<string, unknown>[]);
        setParsing(false);
      },
      error: (err) => {
        setParseError(err.message ?? "Error al parsear el CSV");
        setParsing(false);
      },
    });
  }, [csvResource]);

  const ml = useMemo(() => {
    if (!rows || rows.length < 20) return null;
    const { matrix, columns } = pickNumericMatrix(rows);
    if (columns.length < 2 || matrix.length < k * 2) return null;
    const standardized = standardize(matrix);
    let projection: number[][];
    let pcaUsed = false;
    if (columns.length > 2) {
      const pca = new PCA(standardized);
      projection = pca.predict(standardized, { nComponents: 2 }).to2DArray();
      pcaUsed = true;
    } else {
      projection = standardized;
    }
    const km = kmeans(standardized, Math.min(k, matrix.length), {
      initialization: "kmeans++",
    });
    const scatterByCluster: Record<number, { x: number; y: number }[]> = {};
    projection.forEach((p, i) => {
      const cl = km.clusters[i] ?? 0;
      scatterByCluster[cl] = scatterByCluster[cl] ?? [];
      scatterByCluster[cl].push({ x: p[0], y: p[1] });
    });
    return {
      columns,
      pcaUsed,
      centroids: km.centroids,
      scatter: Object.entries(scatterByCluster).map(([cn, pts]) => ({
        cluster: Number(cn),
        points: pts,
      })),
      rows: matrix.length,
    };
  }, [rows, k]);

  if (!csvResource) {
    return (
      <EmptyState
        title="Sin CSV"
        description="Necesitamos un recurso CSV/TXT con columnas numéricas para correr K-Means."
      />
    );
  }
  if (parseError) {
    return (
      <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-300">
        {parseError}
      </div>
    );
  }
  if (parsing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <SkeletonChart height={380} />
      </div>
    );
  }
  if (rows && !ml) {
    return (
      <EmptyState
        title="Insuficiente para clustering"
        description={`Necesitamos ≥ 2 columnas numéricas y ≥ ${k * 2} filas válidas.`}
      />
    );
  }
  if (!ml) return null;

  return (
    <>
      <Card className="mb-6">
        <CardHeader
          title="Configuración del modelo"
          subtitle="K-Means client-side, kmeans++ init, columnas numéricas estandarizadas"
        />
        <CardBody>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-default)]">k = {k}</span>
            <Slider.Root
              min={2}
              max={8}
              step={1}
              value={[k]}
              onValueChange={(v) => setK(v[0])}
              className="relative flex items-center h-5 flex-1 max-w-md"
            >
              <Slider.Track className="bg-[var(--surface-3)] relative grow rounded-full h-1.5">
                <Slider.Range className="absolute bg-[var(--color-accent-600)] rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                aria-label="Número de clusters"
                className="block w-4 h-4 bg-[var(--surface-1)] border-2 border-[var(--color-accent-600)] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)]"
              />
            </Slider.Root>
          </div>
        </CardBody>
      </Card>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI label="Filas usadas" value={formatNumber(ml.rows)} />
        <KPI label="Variables" value={formatNumber(ml.columns.length)} />
        <KPI label="Clusters" value={k} tone="accent" />
        <KPI label="Proyección" value={<span className="text-base">{ml.pcaUsed ? "PCA(2)" : "directa"}</span>} />
      </section>

      <Card className="mb-6">
        <CardHeader title="Lectura automática" subtitle="Heurística sobre la dimensión más extrema por cluster" />
        <CardBody>
          <p className="text-sm text-[var(--text-default)]">
            {narrate(ml.centroids, ml.columns)}
          </p>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader title="Scatter de clusters" subtitle="2 componentes principales · coloreado por grupo" />
        <CardBody>
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis type="number" dataKey="x" name="PC1" stroke="var(--text-muted)" />
                <YAxis type="number" dataKey="y" name="PC2" stroke="var(--text-muted)" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                {ml.scatter.map((s) => (
                  <Scatter
                    key={s.cluster}
                    name={`Grupo ${s.cluster}`}
                    data={s.points}
                    fill={CLUSTER_COLORS[s.cluster % CLUSTER_COLORS.length]}
                  >
                    {s.points.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CLUSTER_COLORS[s.cluster % CLUSTER_COLORS.length]}
                      />
                    ))}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Centroides" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="text-left px-4 py-2">Cluster</th>
                  {ml.columns.map((c) => (
                    <th key={c} className="text-right px-4 py-2 truncate max-w-[10rem]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ml.centroids.map((c, i) => (
                  <tr key={i} className="border-t border-[var(--border-soft)]">
                    <td className="px-4 py-2 mono text-[var(--text-strong)]">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                        style={{ background: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}
                      />
                      {i}
                    </td>
                    {c.map((v, j) => (
                      <td key={j} className="px-4 py-2 text-right mono numeric">
                        {Number(v).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
