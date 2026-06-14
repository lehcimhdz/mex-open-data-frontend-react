/**
 * Server-side EDA tab.
 *
 * Renders the precomputed profile.json (built by mex-open-data-eda).
 * Falls through to the legacy client-side parser when the backend returns 404.
 */

import { Suspense, lazy, useMemo } from "react";
import { ApiError } from "../../api/client";
import { useEdaProfile, useEdaSample } from "../../api/hooks";
import type {
  DatasetDetail,
  EdaColumn,
  EdaCrossTab,
  EdaProfile,
} from "../../api/types";
import { Card, CardBody, CardHeader } from "../../ui/card";
import { KPI } from "../../ui/kpi";
import { Tag } from "../../ui/tag";
import { Sparkline } from "../../ui/sparkline";
import { Skeleton, SkeletonChart } from "../../ui/skeleton";
import { EmptyState } from "../../ui/empty-state";
import { formatBytes, formatDate, formatNumber } from "../../lib/format";

const LegacyEda = lazy(() =>
  import("./Eda").then((m) => ({ default: m.DatasetEda }))
);

const ChartsBlock = lazy(() => import("./EdaCharts"));

export function DatasetEdaServerSide({ data }: { data: DatasetDetail }) {
  const profile = useEdaProfile(data.slug);
  const sample = useEdaSample(data.slug);

  if (profile.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <SkeletonChart height={240} />
        <SkeletonChart height={260} />
      </div>
    );
  }

  if (profile.error) {
    const status = profile.error instanceof ApiError ? profile.error.status : 0;
    if (status === 404) {
      // Fallback: client-side parser still works for unprofiled datasets.
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300">
            Este dataset todavía no tiene perfil precomputado. Parsing en
            cliente (más lento, sujeto a CORS) como respaldo.
          </div>
          <Suspense fallback={<SkeletonChart height={240} />}>
            <LegacyEda data={data} />
          </Suspense>
        </div>
      );
    }
    return (
      <EmptyState
        title="No se pudo cargar el EDA"
        description={profile.error instanceof Error ? profile.error.message : "Error desconocido"}
      />
    );
  }

  if (!profile.data) return null;
  const p = profile.data;

  return <ProfileRender profile={p} sampleRows={sample.data?.rows ?? null} />;
}

function ProfileRender({
  profile,
  sampleRows,
}: {
  profile: EdaProfile;
  sampleRows: (string | null)[][] | null;
}) {
  const generatedDays = useMemo(() => {
    try {
      const dt = new Date(profile.generated_at);
      return Math.floor((Date.now() - dt.getTime()) / 86_400_000);
    } catch {
      return null;
    }
  }, [profile.generated_at]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <p className="serif text-base text-[var(--text-default)]">
            {profile.narrative}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] mono text-[var(--text-muted)]">
            <span>generado · {formatDate(profile.generated_at)}</span>
            {generatedDays !== null && generatedDays > 7 ? (
              <Tag variant="warn">{generatedDays}d sin actualizar</Tag>
            ) : null}
            <span>recurso · {profile.resource.name ?? profile.resource.id}</span>
            <span>delim · "{profile.resource.delimiter}"</span>
            <span>bytes · {formatBytes(profile.resource.bytes_read)}</span>
            {profile.resource.truncated ? (
              <Tag variant="warn">truncado</Tag>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI label="Filas" value={formatNumber(profile.shape.rows)} />
        <KPI label="Columnas" value={formatNumber(profile.shape.columns)} />
        <KPI
          label="Numéricas"
          value={formatNumber(profile.summary_counts.numeric)}
          tone={profile.summary_counts.numeric > 0 ? "accent" : "default"}
        />
        <KPI label="Categóricas" value={formatNumber(profile.summary_counts.categorical)} />
        <KPI label="Temporales" value={formatNumber(profile.summary_counts.date)} />
      </section>

      <Card>
        <CardHeader title="Perfil por columna" subtitle="Tipo, % de nulos, valores distintos y resumen" />
        <CardBody className="p-0">
          <ProfileTable columns={profile.columns} />
        </CardBody>
      </Card>

      <Suspense fallback={<SkeletonChart height={280} />}>
        <ChartsBlock profile={profile} />
      </Suspense>

      {profile.cross_tabs.length ? <CrossTabs items={profile.cross_tabs} /> : null}

      {sampleRows ? (
        <Card>
          <CardHeader
            title="Vista previa"
            subtitle="Primeros 50 renglones tal como vinieron del CSV"
          />
          <CardBody className="p-0 overflow-x-auto">
            <table className="text-xs w-full border-separate border-spacing-0">
              <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider text-[10.5px]">
                <tr>
                  {profile.columns.slice(0, 12).map((c) => (
                    <th key={c.name} className="text-left px-3 py-2 border-b border-[var(--border-soft)]">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.slice(0, 30).map((row, ri) => (
                  <tr key={ri} className="hover:bg-[var(--surface-2)]">
                    {row.slice(0, 12).map((v, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-1.5 border-b border-[var(--border-soft)] truncate max-w-[14rem] text-[var(--text-default)]"
                      >
                        {v ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function ProfileTable({ columns }: { columns: EdaColumn[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider text-[10.5px]">
          <tr>
            <th className="text-left px-4 py-2">Columna</th>
            <th className="text-left px-4 py-2">Tipo</th>
            <th className="text-right px-4 py-2">% nulos</th>
            <th className="text-right px-4 py-2">Distintos</th>
            <th className="text-left px-4 py-2">Resumen</th>
            <th className="text-left px-4 py-2 w-28">Distribución</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((c) => {
            const sparkValues = c.numeric
              ? c.numeric.histogram.map((h) => h.count)
              : c.temporal
              ? c.temporal.buckets.map((b) => b.count)
              : c.top_values.length
              ? c.top_values.slice(0, 12).map((t) => t.count)
              : [];
            const resumen = c.numeric
              ? `μ=${c.numeric.mean.toFixed(2)} · σ=${c.numeric.std.toFixed(2)} · p95=${c.numeric.p95.toFixed(2)}`
              : c.temporal
              ? `${c.temporal.min.slice(0, 10)} → ${c.temporal.max.slice(0, 10)}`
              : c.top_values
                  .slice(0, 3)
                  .map((t) => `${t.value} (${t.count})`)
                  .join(" · ") || "—";
            return (
              <tr key={c.name} className="border-t border-[var(--border-soft)]">
                <td className="px-4 py-2 font-medium text-[var(--text-strong)] truncate max-w-[14rem]">
                  {c.name}
                </td>
                <td className="px-4 py-2">
                  <Tag variant={c.type === "number" ? "accent" : "neutral"}>{c.type}</Tag>
                </td>
                <td className="px-4 py-2 text-right numeric">{c.null_pct.toFixed(1)}%</td>
                <td className="px-4 py-2 text-right numeric">{formatNumber(c.distinct)}</td>
                <td className="px-4 py-2 text-xs text-[var(--text-muted)]">{resumen}</td>
                <td className="px-4 py-2">
                  {sparkValues.length ? (
                    <Sparkline
                      values={sparkValues}
                      width={88}
                      height={20}
                      stroke="var(--color-accent-600)"
                    />
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CrossTabs({ items }: { items: EdaCrossTab[] }) {
  return (
    <Card>
      <CardHeader
        title="Tablas cruzadas"
        subtitle="Contingencia entre las categóricas con mayor χ²"
      />
      <CardBody className="space-y-6">
        {items.map((ct) => (
          <div key={`${ct.x}-${ct.y}`}>
            <div className="text-sm font-medium text-[var(--text-strong)] mb-2">
              {ct.x} × {ct.y}
              {ct.chi2 !== undefined ? (
                <span className="ml-2 text-[10px] mono text-[var(--text-muted)]">
                  χ² = {ct.chi2}
                </span>
              ) : null}
            </div>
            <div className="overflow-x-auto">
              <table className="text-xs border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="p-1.5 sticky left-0 bg-[var(--surface-1)]"></th>
                    {ct.y_labels.map((l) => (
                      <th
                        key={l}
                        className="p-1.5 text-[var(--text-muted)] font-medium text-left"
                      >
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ct.matrix.map((row, ri) => {
                    const rowMax = Math.max(...row, 1);
                    return (
                      <tr key={ri}>
                        <th
                          className="p-1.5 text-left text-[var(--text-muted)] font-medium sticky left-0 bg-[var(--surface-1)]"
                        >
                          {ct.x_labels[ri]}
                        </th>
                        {row.map((v, ci) => {
                          const alpha = Math.min(0.95, v / rowMax);
                          return (
                            <td
                              key={ci}
                              className="p-1.5 text-center mono numeric"
                              style={{
                                background: `rgba(188, 57, 8, ${alpha.toFixed(2)})`,
                                color: alpha > 0.5 ? "white" : "var(--text-strong)",
                                minWidth: 44,
                              }}
                            >
                              {v}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
