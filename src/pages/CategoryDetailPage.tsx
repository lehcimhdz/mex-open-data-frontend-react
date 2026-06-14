import { useMemo, useRef, useState } from "react";
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
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCategory, useDatasetList } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { KPI } from "../ui/kpi";
import { Card, CardBody, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { formatDate, formatNumber } from "../lib/format";
import { EmptyState } from "../ui/empty-state";
import type { Dataset } from "../api/types";

const VIZ_STONE = [
  "var(--color-ink-9)",
  "var(--color-ink-7)",
  "var(--color-ink-5)",
  "var(--color-ink-3)",
  "var(--color-accent-600)",
];

const PAGE_SIZE = 100;
const ROW_HEIGHT = 64;
type Sort = "recent" | "title" | "slug";

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cat = useCategory(slug);
  const [sort, setSort] = useState<Sort>("recent");
  const [page, setPage] = useState(0);

  const datasets = useDatasetList({
    category: slug,
    sort,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

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

  const rows = datasets.data?.data ?? [];
  const totalCount = datasets.data?.totalCount ?? rows.length;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE));

  return (
    <PageShell width="wide">
      <PageHero
        kicker={`categoría · ${slug}`}
        title={cat.data?.name ?? slug ?? "Categoría"}
        subtitle={cat.data?.description ?? undefined}
        actions={
          <Link
            to="/categorias"
            className="inline-flex h-9 items-center gap-1 px-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Volver
          </Link>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPI label="Slug" value={<span className="mono text-base">{cat.data?.slug ?? slug}</span>} />
        <KPI
          label="Datasets"
          value={formatNumber(cat.data?.dataset_count ?? totalCount)}
          helper="Anunciados por la categoría"
        />
        <KPI
          label="Indexados aquí"
          value={formatNumber(totalCount)}
          helper="Los que pudimos sincronizar"
          tone="accent"
        />
        <KPI label="Última actualización" value={formatDate(cat.data?.updated_at)} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader title="Top organizaciones" subtitle="Las 5 instituciones que más publican aquí" />
          <CardBody>
            <TopOrgs rows={rows} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Distribución de recursos" subtitle="Cuántos archivos suele traer cada dataset" />
          <CardBody>
            <ResourceHistogram counts={rows.map((d) => d.resource_count ?? 0)} />
          </CardBody>
        </Card>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
          <h2 className="text-base font-semibold text-[var(--text-strong)] serif">
            Datasets
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <label className="inline-flex items-center gap-2 text-[var(--text-muted)]">
              Ordenar
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  setPage(0);
                }}
                className="h-8 px-2 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-[var(--text-strong)]"
              >
                <option value="recent">Más recientes</option>
                <option value="title">Título</option>
                <option value="slug">Slug</option>
              </select>
            </label>
            <span className="text-[var(--text-muted)]">
              {formatNumber(totalCount)} · página{" "}
              <span className="mono">{page + 1}</span> /{" "}
              <span className="mono">{formatNumber(totalPages)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                leftIcon={<ChevronLeft size={12} aria-hidden="true" />}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                rightIcon={<ChevronRight size={12} aria-hidden="true" />}
              >
                Siguiente
              </Button>
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <Card>
            <EmptyState
              title="Sin datasets cargados"
              description="El backend no tiene datasets indexados para esta categoría todavía. Corre el pipeline para poblarla."
            />
          </Card>
        ) : (
          <VirtualList rows={rows} />
        )}
      </section>
    </PageShell>
  );
}

function VirtualList({ rows }: { rows: Dataset[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const v = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => parentRef.current,
    overscan: 12,
  });

  return (
    <div
      ref={parentRef}
      className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] overflow-auto"
      style={{ height: "min(70vh, 640px)" }}
    >
      <div style={{ height: v.getTotalSize(), position: "relative" }}>
        {v.getVirtualItems().map((vi) => {
          const d = rows[vi.index];
          return (
            <div
              key={vi.key}
              ref={v.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${vi.start}px)`,
              }}
            >
              <Link
                to={`/datasets/${d.slug}`}
                className="block px-4 py-3 border-b border-[var(--border-soft)] hover:bg-[var(--surface-2)] transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex justify-between gap-3 items-baseline">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate">
                    {d.title}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] mono shrink-0">
                    {formatDate(d.last_updated)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] mono text-[var(--text-muted)] flex gap-2 flex-wrap items-baseline">
                  <span>{d.slug}</span>
                  {d.organization ? <span>· {d.organization}</span> : null}
                  <span>· {formatNumber(d.resource_count ?? 0)} recursos</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopOrgs({ rows }: { rows: Dataset[] }) {
  const top = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const k = r.organization ?? "—";
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 28 ? name.slice(0, 27) + "…" : name,
        count,
      }));
  }, [rows]);

  if (!top.length)
    return (
      <EmptyState title="Sin organizaciones" description="No hay datos suficientes en la página actual." />
    );

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={top} layout="vertical" margin={{ left: 0, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
          <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={140}
            stroke="var(--text-muted)"
            tick={{ fontSize: 11 }}
          />
          <Tooltip />
          <Bar dataKey="count" fill="var(--color-accent-600)" radius={[3, 3, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
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
              <Cell key={i} fill={VIZ_STONE[i % VIZ_STONE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
