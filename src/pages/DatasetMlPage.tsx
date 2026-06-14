import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Papa from "papaparse";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";
import { kmeans } from "ml-kmeans";
import { PCA } from "ml-pca";
import { useDataset } from "../api/hooks";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { formatNumber } from "../lib/format";

const MAX_ROWS = 1500;
const K = 4;
const CLUSTER_COLORS = ["#059669", "#dc2626", "#f59e0b", "#3b82f6", "#a855f7", "#0ea5e9"];

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

export default function DatasetMlPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useDataset(slug);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const csvResource = useMemo(
    () =>
      data?.resources.find((r) => {
        const f = (r.format || "").toLowerCase();
        return (f === "csv" || f === "txt") && r.download_url;
      }) ?? null,
    [data]
  );

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
    if (columns.length < 2 || matrix.length < K * 2) return null;
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
    const km = kmeans(standardized, Math.min(K, matrix.length), { initialization: "kmeans++" });
    const scatterByCluster: Record<number, { x: number; y: number }[]> = {};
    projection.forEach((p, i) => {
      const cl = km.clusters[i] ?? 0;
      scatterByCluster[cl] = scatterByCluster[cl] ?? [];
      scatterByCluster[cl].push({ x: p[0], y: p[1] });
    });
    return {
      columns,
      pcaUsed,
      clusters: km.clusters,
      centroids: km.centroids,
      scatter: Object.entries(scatterByCluster).map(([k, pts]) => ({
        cluster: Number(k),
        points: pts,
      })),
      rows: matrix.length,
    };
  }, [rows]);

  if (isLoading) return <Loader />;
  if (error) return <ErrorBox error={error} />;
  if (!data) return null;

  if (!csvResource) {
    return (
      <div>
        <PageHeader
          title={`ML · ${data.title}`}
          actions={
            <Link
              to={`/datasets/${slug}`}
              className="text-sm text-brand-700 hover:underline px-3 py-2"
            >
              ← Volver
            </Link>
          }
        />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Sin recurso CSV/TXT no podemos correr clustering.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`ML · ${data.title}`}
        subtitle={`Clustering K-Means (k=${K}) sobre columnas numéricas, proyectado a 2D con PCA.`}
        actions={
          <Link
            to={`/datasets/${slug}/eda`}
            className="text-sm px-3 py-2 bg-slate-100 text-slate-900 rounded-md hover:bg-slate-200"
          >
            ← EDA
          </Link>
        }
      />

      {parsing ? <Loader label="Procesando..." /> : null}
      {parseError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {parseError}
        </div>
      ) : null}

      {!parsing && rows && !ml ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          El recurso no tiene suficientes columnas numéricas o renglones para
          entrenar un K-Means significativo (necesitamos ≥ 2 columnas numéricas
          y ≥ {K * 2} filas válidas).
        </div>
      ) : null}

      {ml ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Filas usadas" value={formatNumber(ml.rows)} />
            <StatCard label="Variables" value={formatNumber(ml.columns.length)} />
            <StatCard label="Clusters" value={K} tone="good" />
            <StatCard
              label="Proyección"
              value={ml.pcaUsed ? "PCA(2)" : "directa"}
            />
          </div>

          <section className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Scatter — clusters en 2D
            </h2>
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="PC1"
                    stroke="#64748b"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="PC2"
                    stroke="#64748b"
                  />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  {ml.scatter.map((s) => (
                    <Scatter
                      key={s.cluster}
                      name={`Cluster ${s.cluster}`}
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
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Centroides
            </h2>
            <div className="overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-xs uppercase text-slate-500 border-b">
                    <th className="text-left p-2">Cluster</th>
                    {ml.columns.map((c) => (
                      <th key={c} className="text-right p-2">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ml.centroids.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2 font-mono text-slate-700">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                          style={{
                            background:
                              CLUSTER_COLORS[i % CLUSTER_COLORS.length],
                          }}
                        />
                        {i}
                      </td>
                      {c.map((v, j) => (
                        <td key={j} className="p-2 text-right font-mono">
                          {Number(v).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
