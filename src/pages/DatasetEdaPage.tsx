import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Papa from "papaparse";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDataset } from "../api/hooks";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { formatNumber } from "../lib/format";
import { correlationMatrix, profileColumn, type ColumnProfile } from "../lib/stats";

const MAX_ROWS = 2000;

function CorrelationHeatmap({
  matrix,
}: {
  matrix: ReturnType<typeof correlationMatrix>;
}) {
  if (matrix.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="p-2"></th>
            {matrix.map((m) => (
              <th key={m.name} className="p-2 font-medium text-slate-600">
                {m.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.name}>
              <th className="p-2 text-left font-medium text-slate-600">{row.name}</th>
              {row.correlations.map((c) => {
                const v = Number.isFinite(c.r) ? c.r : 0;
                const hue = v >= 0 ? "16, 185, 129" : "239, 68, 68";
                const alpha = Math.min(Math.abs(v), 1);
                return (
                  <td
                    key={`${row.name}-${c.other}`}
                    className="p-2 text-center font-mono"
                    style={{
                      background: `rgba(${hue}, ${alpha.toFixed(2)})`,
                      color: alpha > 0.55 ? "white" : "#0f172a",
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

export default function DatasetEdaPage() {
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

  if (isLoading) return <Loader />;
  if (error) return <ErrorBox error={error} />;
  if (!data) return null;

  if (!csvResource) {
    return (
      <div>
        <PageHeader
          title={`EDA · ${data.title}`}
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
          Este dataset no tiene recursos CSV/TXT — no podemos generar un EDA
          automático. Los formatos binarios (XLSX, ZIP, SHP) requieren preprocesar
          desde el backend.
        </div>
      </div>
    );
  }

  const columnNames = rows && rows.length ? Object.keys(rows[0]) : [];
  const profiles: ColumnProfile[] = columnNames.map((name) =>
    profileColumn(
      name,
      (rows ?? []).map((r) => r[name])
    )
  );
  const numericCols = profiles.filter((p) => p.numeric);
  const matrix = correlationMatrix(
    numericCols.map((p) => ({
      name: p.name,
      values: (rows ?? [])
        .map((r) => Number(r[p.name]))
        .filter((n) => Number.isFinite(n)),
    }))
  );

  return (
    <div>
      <PageHeader
        title={`EDA · ${data.title}`}
        subtitle={`Análisis exploratorio sobre los primeros ${MAX_ROWS} renglones del recurso ${csvResource.name ?? csvResource.resource_id}.`}
        actions={
          <Link
            to={`/datasets/${slug}/ml`}
            className="text-sm px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700"
          >
            Insights ML →
          </Link>
        }
      />

      {parsing ? <Loader label="Descargando y parseando CSV..." /> : null}
      {parseError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {parseError}
        </div>
      ) : null}

      {rows ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Renglones cargados" value={formatNumber(rows.length)} />
            <StatCard label="Columnas" value={formatNumber(columnNames.length)} />
            <StatCard
              label="Numéricas"
              value={formatNumber(numericCols.length)}
              tone="good"
            />
            <StatCard
              label="Recurso"
              value={csvResource.format ?? "?"}
              helper={(csvResource.name ?? csvResource.resource_id).slice(0, 28)}
            />
          </div>

          <section className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Perfil por columna
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-500 border-b">
                    <th className="text-left p-2">Columna</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-right p-2">% nulos</th>
                    <th className="text-right p-2">Distintos</th>
                    <th className="text-left p-2">Top / Resumen</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="p-2 font-medium text-slate-900">{p.name}</td>
                      <td className="p-2 text-slate-600">{p.type}</td>
                      <td className="p-2 text-right text-slate-600">
                        {p.nullPct.toFixed(1)}%
                      </td>
                      <td className="p-2 text-right text-slate-600">
                        {formatNumber(p.distinct)}
                      </td>
                      <td className="p-2 text-slate-600 text-xs">
                        {p.numeric ? (
                          <>μ={p.numeric.mean.toFixed(2)}, σ={p.numeric.std.toFixed(2)}, p95={p.numeric.p95.toFixed(2)}</>
                        ) : p.topValues.length ? (
                          p.topValues
                            .slice(0, 3)
                            .map((t) => `${t.value} (${t.count})`)
                            .join(" · ")
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {numericCols.slice(0, 3).map((p) => (
            <section
              key={p.name}
              className="bg-white rounded-xl border border-slate-200 p-4 mb-4"
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Histograma · {p.name}
              </h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={p.numeric!.histogram}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="bin" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          ))}

          {numericCols.length >= 2 ? (
            <section className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Correlación de Pearson (numéricas)
              </h3>
              <CorrelationHeatmap matrix={matrix} />
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
