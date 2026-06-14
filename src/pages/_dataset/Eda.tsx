import { useEffect, useMemo, useState } from "react";
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
import { Card, CardBody, CardHeader } from "../../ui/card";
import { KPI } from "../../ui/kpi";
import { Skeleton, SkeletonChart } from "../../ui/skeleton";
import { EmptyState } from "../../ui/empty-state";
import { formatNumber } from "../../lib/format";
import { correlationMatrix, profileColumn, type ColumnProfile } from "../../lib/stats";
import { Sparkline } from "../../ui/sparkline";
import type { DatasetDetail } from "../../api/types";
import { Tag } from "../../ui/tag";
import { apiGet, ApiError } from "../../api/client";
import type { ResourcePreview } from "../../api/hooks";

const MAX_ROWS = 2000;

function autoType(v: string): unknown {
  if (v === "" || v === null || v === undefined) return null;
  const trimmed = v.trim();
  if (trimmed === "") return null;
  // booleans
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  // number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return trimmed;
}

export function DatasetEda({ data }: { data: DatasetDetail }) {
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
  const [selectedCol, setSelectedCol] = useState<string | null>(null);

  useEffect(() => {
    setRows(null);
    setParseError(null);
    setSelectedCol(null);
    if (!csvResource || !csvResource.download_url) return;

    let cancelled = false;
    setParsing(true);

    // 1) Try the backend preview first — bypasses CORS + encoding issues.
    const tryBackend = async () => {
      try {
        const preview = await apiGet<ResourcePreview>(
          `/resources/${csvResource.resource_id}/preview`,
          { rows: MAX_ROWS }
        );
        if (cancelled) return;
        const cols = preview.columns;
        const out = preview.rows.map((r) => {
          const o: Record<string, unknown> = {};
          for (let i = 0; i < cols.length; i++) o[cols[i]] = autoType(r[i] ?? "");
          return o;
        });
        setRows(out);
        setParsing(false);
        return true;
      } catch (exc) {
        // 404/415 from backend → fall through to client-side parse.
        if (exc instanceof ApiError && (exc.status === 404 || exc.status === 415)) {
          return false;
        }
        // 5xx or network → still try client-side as a last resort.
        return false;
      }
    };

    // 2) Fallback: PapaParse directly from the upstream URL.
    const tryClient = () => {
      Papa.parse(csvResource.download_url!, {
        download: true,
        header: true,
        skipEmptyLines: true,
        preview: MAX_ROWS,
        dynamicTyping: true,
        complete: (result) => {
          if (cancelled) return;
          setRows(result.data as Record<string, unknown>[]);
          setParsing(false);
        },
        error: (err) => {
          if (cancelled) return;
          setParseError(err.message ?? "Error al parsear el CSV");
          setParsing(false);
        },
      });
    };

    tryBackend().then((ok) => {
      if (!ok && !cancelled) tryClient();
    });

    return () => {
      cancelled = true;
    };
  }, [csvResource]);

  const profiles: ColumnProfile[] = useMemo(() => {
    if (!rows) return [];
    const cols = rows.length ? Object.keys(rows[0]) : [];
    return cols.map((name) =>
      profileColumn(
        name,
        rows.map((r) => r[name])
      )
    );
  }, [rows]);

  useEffect(() => {
    if (!selectedCol && profiles.length) {
      const num = profiles.find((p) => p.numeric);
      setSelectedCol(num?.name ?? profiles[0].name);
    }
  }, [profiles, selectedCol]);

  const numericCols = profiles.filter((p) => p.numeric);

  const matrix = useMemo(
    () =>
      correlationMatrix(
        numericCols.map((p) => ({
          name: p.name,
          values: (rows ?? [])
            .map((r) => Number(r[p.name]))
            .filter((n) => Number.isFinite(n)),
        }))
      ),
    [numericCols, rows]
  );

  if (!csvResource) {
    return (
      <EmptyState
        title="Sin recursos CSV/TXT"
        description="No podemos generar un EDA automático porque este dataset no tiene un recurso de texto descargable. Los formatos binarios requieren preprocesar desde el backend."
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
        <SkeletonChart height={260} />
        <SkeletonChart height={200} />
      </div>
    );
  }

  if (!rows) return null;
  const selected = profiles.find((p) => p.name === selectedCol) ?? null;

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI label="Renglones" value={formatNumber(rows.length)} helper={`cap ${MAX_ROWS}`} />
        <KPI label="Columnas" value={formatNumber(profiles.length)} />
        <KPI label="Numéricas" value={formatNumber(numericCols.length)} tone="accent" />
        <KPI
          label="Fuente"
          value={
            <span className="text-base">
              {(csvResource.name ?? csvResource.resource_id).slice(0, 28)}
            </span>
          }
          helper={(csvResource.format ?? "").toUpperCase()}
        />
      </section>

      <Card className="mb-6">
        <CardHeader
          title="Variable enfocada"
          subtitle="Selecciona una columna para ver su perfil con detalle"
          actions={
            <select
              value={selectedCol ?? ""}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="h-8 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] px-2 text-sm text-[var(--text-strong)]"
            >
              {profiles.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} · {p.type}
                </option>
              ))}
            </select>
          }
        />
        <CardBody>
          {selected ? <FocusedColumn profile={selected} /> : null}
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader title="Perfil por columna" subtitle="Tipo, % de nulos, top valores" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="text-left px-4 py-2">Columna</th>
                  <th className="text-left px-4 py-2">Tipo</th>
                  <th className="text-right px-4 py-2">% nulos</th>
                  <th className="text-right px-4 py-2">Distintos</th>
                  <th className="text-left px-4 py-2">Resumen</th>
                  <th className="text-left px-4 py-2 w-28">Sparkline</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr
                    key={p.name}
                    onClick={() => setSelectedCol(p.name)}
                    className={`border-t border-[var(--border-soft)] cursor-pointer hover:bg-[var(--surface-2)] ${
                      selectedCol === p.name ? "bg-[var(--surface-2)]" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-[var(--text-strong)] truncate max-w-[14rem]">
                      {p.name}
                    </td>
                    <td className="px-4 py-2">
                      <Tag variant={p.type === "number" ? "accent" : "neutral"}>
                        {p.type}
                      </Tag>
                    </td>
                    <td className="px-4 py-2 text-right numeric">
                      {p.nullPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right numeric">
                      {formatNumber(p.distinct)}
                    </td>
                    <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
                      {p.numeric
                        ? `μ=${p.numeric.mean.toFixed(2)}, σ=${p.numeric.std.toFixed(2)}, p95=${p.numeric.p95.toFixed(2)}`
                        : p.topValues
                            .slice(0, 3)
                            .map((t) => `${t.value} (${t.count})`)
                            .join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {p.numeric ? (
                        <Sparkline
                          values={p.numeric.histogram.map((h) => h.count)}
                          width={88}
                          height={20}
                          stroke="var(--color-accent-600)"
                        />
                      ) : (
                        <span className="text-[11px] mono text-[var(--text-muted)]">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {numericCols.length >= 2 ? (
        <Card>
          <CardHeader
            title="Correlación de Pearson"
            subtitle="Únicamente columnas numéricas; verde positiva, rojo negativa"
          />
          <CardBody>
            <CorrelationHeatmap matrix={matrix} />
          </CardBody>
        </Card>
      ) : null}
    </>
  );
}

function FocusedColumn({ profile }: { profile: ColumnProfile }) {
  if (profile.numeric) {
    return (
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={profile.numeric.histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
            <XAxis dataKey="bin" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-muted)" allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--color-accent-600)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  const top = profile.topValues.slice(0, 10);
  if (!top.length) {
    return (
      <EmptyState title="Columna sin valores" description="Todos los renglones son nulos." />
    );
  }
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={top} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
          <XAxis type="number" stroke="var(--text-muted)" />
          <YAxis dataKey="value" type="category" width={140} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="var(--color-viz-3)" radius={[3, 3, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

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
              <th key={m.name} className="p-2 font-medium text-[var(--text-muted)]">
                {m.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.name}>
              <th className="p-2 text-left font-medium text-[var(--text-muted)]">
                {row.name}
              </th>
              {row.correlations.map((c) => {
                const v = Number.isFinite(c.r) ? c.r : 0;
                const hue = v >= 0 ? "16, 185, 129" : "239, 68, 68";
                const alpha = Math.min(Math.abs(v), 1);
                return (
                  <td
                    key={`${row.name}-${c.other}`}
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
