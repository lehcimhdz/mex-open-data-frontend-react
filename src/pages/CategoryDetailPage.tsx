import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { useCategory, useCategoryDatasets } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { KPI } from "../ui/kpi";
import { Card, CardBody, CardHeader } from "../ui/card";
import { formatDate, formatNumber } from "../lib/format";
import { EmptyState } from "../ui/empty-state";

const VIZ = [
  "var(--color-viz-2)",
  "var(--color-viz-3)",
  "var(--color-viz-4)",
  "var(--color-viz-5)",
  "var(--color-viz-6)",
];

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cat = useCategory(slug);
  const [limit, setLimit] = useState(50);
  const datasets = useCategoryDatasets(slug, { limit });

  if (cat.isLoading || datasets.isLoading)
    return (
      <PageShell width="wide">
        <Loader />
      </PageShell>
    );
  if (cat.error)
    return (
      <PageShell width="wide">
        <ErrorBox error={cat.error} />
      </PageShell>
    );
  if (datasets.error)
    return (
      <PageShell width="wide">
        <ErrorBox error={datasets.error} />
      </PageShell>
    );

  const list = datasets.data ?? [];

  const totalResources = list.reduce((s, d) => s + (d.resource_count ?? 0), 0);
  const orgCounts = list.reduce<Record<string, number>>((acc, d) => {
    const k = d.organization ?? d.organization_name ?? "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const topOrgs = Object.entries(orgCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.length > 28 ? name.slice(0, 27) + "…" : name, count }));

  return (
    <PageShell width="wide">
      <PageHero
        kicker={`categoría · ${slug}`}
        title={cat.data?.name ?? slug ?? "Categoría"}
        subtitle={cat.data?.description ?? undefined}
        actions={
          <Link
            to="/categorias"
            className="inline-flex h-9 items-center gap-1 px-3 text-sm text-[var(--text-default)] hover:text-[var(--text-strong)]"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Volver
          </Link>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPI label="Slug" value={<span className="mono text-base">{cat.data?.slug ?? slug}</span>} />
        <KPI label="Datasets" value={formatNumber(cat.data?.dataset_count ?? list.length)} helper="En el catálogo" />
        <KPI label="Recursos totales" value={formatNumber(totalResources)} helper="Archivos descargables" />
        <KPI label="Última actualización" value={formatDate(cat.data?.updated_at)} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader title="Top organizaciones" subtitle="5 instituciones que más publican en esta categoría" />
          <CardBody>
            {topOrgs.length ? (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={topOrgs} layout="vertical" margin={{ left: 0, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                    <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={140} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-accent-600)" radius={[3, 3, 3, 3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="Sin organizaciones" description="No tenemos suficientes datasets cargados para esta categoría." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Distribución de recursos" subtitle="Cuántos archivos suele traer cada dataset" />
          <CardBody>
            <ResourceHistogram counts={list.map((d) => d.resource_count ?? 0)} />
          </CardBody>
        </Card>
      </section>

      <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-soft)] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-strong)]">Datasets</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {formatNumber(list.length)} cargados (cap en {limit})
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">Mostrar:</span>
            {[20, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                aria-pressed={limit === n}
                className={`h-6 px-2 rounded mono ${
                  limit === n
                    ? "bg-[var(--color-ink-9)] text-[var(--color-ink-0)] dark:bg-[var(--color-night-9)] dark:text-[var(--color-night-0)]"
                    : "bg-[var(--surface-2)] text-[var(--text-default)] hover:bg-[var(--surface-3)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-[var(--border-soft)]">
          {list.map((d) => (
            <li key={d.slug}>
              <Link
                to={`/datasets/${d.slug}`}
                className="block px-4 py-3 hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex justify-between gap-4 items-baseline">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate">
                    {d.title}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] mono shrink-0">
                    {formatDate(d.last_updated)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                  {d.description ?? "Sin descripción."}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-[var(--text-muted)]">
                  <span className="mono">{d.slug}</span>
                  {d.organization || d.organization_name ? (
                    <span>· {d.organization ?? d.organization_name}</span>
                  ) : null}
                  <span>· {formatNumber(d.resource_count ?? 0)} recursos</span>
                </div>
              </Link>
            </li>
          ))}
          {list.length === 0 ? (
            <li>
              <EmptyState
                title="Sin datasets cargados"
                description="El backend no tiene datasets indexados para esta categoría todavía. Corre el pipeline para poblarla."
              />
            </li>
          ) : null}
        </ul>
      </section>

      <noscript>{VIZ.join(",")}</noscript>
    </PageShell>
  );
}

function ResourceHistogram({ counts }: { counts: number[] }) {
  const bins = useMemo(() => {
    const out = { "0": 0, "1": 0, "2-4": 0, "5-9": 0, "10+": 0 };
    for (const n of counts) {
      if (n === 0) out["0"]++;
      else if (n === 1) out["1"]++;
      else if (n <= 4) out["2-4"]++;
      else if (n <= 9) out["5-9"]++;
      else out["10+"]++;
    }
    return Object.entries(out).map(([bin, count]) => ({ bin, count }));
  }, [counts]);

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Pie
            data={bins}
            dataKey="count"
            nameKey="bin"
            innerRadius={48}
            outerRadius={80}
            stroke="var(--surface-1)"
          >
            {bins.map((_, i) => (
              <Cell key={i} fill={VIZ[i % VIZ.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
