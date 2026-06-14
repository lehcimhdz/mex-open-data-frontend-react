/** Lazy chunk: histograms, top categories, timeline, correlation heatmap, clusters. */

import {
  Bar,
  BarChart,
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
import { Card, CardBody, CardHeader } from "../../ui/card";
import { EmptyState } from "../../ui/empty-state";
import type { EdaProfile } from "../../api/types";

const CLUSTER_COLORS = [
  "var(--color-accent-600)",
  "var(--color-viz-3)",
  "var(--color-viz-4)",
  "var(--color-viz-5)",
  "var(--color-viz-1)",
  "var(--color-viz-6)",
  "#0ea5e9",
  "#84cc16",
];

export default function EdaCharts({ profile }: { profile: EdaProfile }) {
  const numericCols = profile.columns.filter((c) => c.numeric);
  const categoricalCols = profile.columns.filter(
    (c) => (c.type === "string" || c.type === "categorical") && c.top_values.length
  );
  const dateCols = profile.columns.filter((c) => c.temporal);
  const matrix = profile.correlation_matrix;

  return (
    <>
      {numericCols.length ? (
        <Card>
          <CardHeader
            title="Histogramas"
            subtitle={`Las ${Math.min(numericCols.length, 6)} variables numéricas más informativas`}
          />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {numericCols.slice(0, 6).map((c) => (
                <div key={c.name}>
                  <div className="text-xs font-medium text-[var(--text-strong)] mb-1 truncate">
                    {c.name}
                  </div>
                  <div style={{ width: "100%", height: 140 }}>
                    <ResponsiveContainer>
                      <BarChart data={c.numeric!.histogram} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                        <XAxis dataKey="bin" stroke="var(--text-muted)" tick={false} />
                        <YAxis stroke="var(--text-muted)" hide />
                        <Tooltip
                          formatter={(v: number) => v.toLocaleString("es-MX")}
                          labelFormatter={(l) => `bin ${l}`}
                        />
                        <Bar dataKey="count" fill="var(--color-accent-600)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {categoricalCols.length ? (
        <Card>
          <CardHeader
            title="Top categorías"
            subtitle="Los valores más frecuentes en las columnas con cardinalidad limitada"
          />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoricalCols.slice(0, 4).map((c) => (
                <div key={c.name}>
                  <div className="text-xs font-medium text-[var(--text-strong)] mb-1 truncate">
                    {c.name}
                  </div>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={c.top_values.slice(0, 10)}
                        layout="vertical"
                        margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                        <XAxis type="number" stroke="var(--text-muted)" hide />
                        <YAxis
                          dataKey="value"
                          type="category"
                          width={120}
                          stroke="var(--text-muted)"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip formatter={(v: number) => v.toLocaleString("es-MX")} />
                        <Bar dataKey="count" fill="var(--color-viz-3)" radius={[2, 2, 2, 2]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {dateCols.length ? (
        <Card>
          <CardHeader title="Línea de tiempo" subtitle={`${dateCols[0].name} · ${dateCols[0].temporal?.bucket}`} />
          <CardBody>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={dateCols[0].temporal!.buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-accent-600)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {matrix && matrix.columns.length >= 2 ? (
        <Card>
          <CardHeader
            title="Matriz de correlación"
            subtitle="Pearson · verde = positiva, rojo = negativa"
          />
          <CardBody>
            <CorrelationHeatmap matrix={matrix} />
          </CardBody>
        </Card>
      ) : null}

      {profile.clusters ? (
        <Card>
          <CardHeader
            title={`Clusters K-Means (k=${profile.clusters.k})`}
            subtitle={`Proyección ${profile.clusters.projection} sobre ${profile.clusters.feature_columns.length} variables`}
          />
          <CardBody>
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis type="number" dataKey="x" name="PC1" stroke="var(--text-muted)" />
                  <YAxis type="number" dataKey="y" name="PC2" stroke="var(--text-muted)" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  {Array.from({ length: profile.clusters.k }).map((_, c) => {
                    const points = profile.clusters!.sample_points.filter(
                      (p) => p.cluster === c
                    );
                    return (
                      <Scatter key={c} name={`Grupo ${c}`} data={points} fill={CLUSTER_COLORS[c % CLUSTER_COLORS.length]}>
                        {points.map((_, i) => (
                          <Cell key={i} fill={CLUSTER_COLORS[c % CLUSTER_COLORS.length]} />
                        ))}
                      </Scatter>
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </>
  );
}

function CorrelationHeatmap({
  matrix,
}: {
  matrix: { columns: string[]; matrix: number[][] };
}) {
  if (!matrix.columns.length) {
    return <EmptyState title="Sin columnas numéricas" description="No hay correlaciones que mostrar." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="p-2"></th>
            {matrix.columns.map((c) => (
              <th key={c} className="p-2 text-left text-[var(--text-muted)] font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.matrix.map((row, ri) => (
            <tr key={matrix.columns[ri]}>
              <th className="p-2 text-left text-[var(--text-muted)] font-medium">
                {matrix.columns[ri]}
              </th>
              {row.map((v, ci) => {
                const hue = v >= 0 ? "16, 185, 129" : "239, 68, 68";
                const alpha = Math.min(Math.abs(v), 1);
                return (
                  <td
                    key={ci}
                    className="p-2 text-center mono"
                    style={{
                      background: `rgba(${hue}, ${alpha.toFixed(2)})`,
                      color: alpha > 0.55 ? "white" : "var(--text-strong)",
                      minWidth: 60,
                    }}
                  >
                    {v.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
