import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Search } from "lucide-react";
import { useOrganizations } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { formatDate, formatNumber, truncate } from "../lib/format";
import { ApiError } from "../api/client";
import { EmptyState } from "../ui/empty-state";
import { Card } from "../ui/card";

type Sort = "popular" | "alpha" | "recent";

export default function OrganizationsPage() {
  const { data, isLoading, error } = useOrganizations();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  const orgs = useMemo(() => {
    const list = [...(data ?? [])];
    const filtered = q
      ? list.filter(
          (o) =>
            o.title.toLowerCase().includes(q.toLowerCase()) ||
            o.slug.toLowerCase().includes(q.toLowerCase()) ||
            (o.description ?? "").toLowerCase().includes(q.toLowerCase())
        )
      : list;
    if (sort === "alpha") filtered.sort((a, b) => a.title.localeCompare(b.title, "es"));
    else if (sort === "recent")
      filtered.sort(
        (a, b) =>
          new Date(b.created ?? 0).getTime() - new Date(a.created ?? 0).getTime()
      );
    else filtered.sort((a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0));
    return filtered;
  }, [data, q, sort]);

  if (isLoading)
    return (
      <PageShell width="wide">
        <Loader />
      </PageShell>
    );

  if (error) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 404) {
      return (
        <PageShell width="wide">
          <PageHero
            kicker="catálogo · instituciones"
            title="Organizaciones"
            subtitle="Las instituciones que publican datos."
          />
          <EmptyState
            icon={<Building2 size={22} aria-hidden="true" />}
            title="Tu backend todavía no expone /organizations"
            description="Está previsto en el spec 02_backend.md. Mientras tanto puedes invocar la librería con open-data-mx organizations."
          />
        </PageShell>
      );
    }
    return (
      <PageShell width="wide">
        <PageHero title="Organizaciones" />
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : "Error desconocido"}
        </div>
      </PageShell>
    );
  }

  const total = data?.length ?? 0;
  const totalDatasets = (data ?? []).reduce((s, o) => s + (o.dataset_count ?? 0), 0);

  return (
    <PageShell width="wide">
      <PageHero
        kicker="catálogo · instituciones"
        title="Organizaciones"
        subtitle={`${formatNumber(total)} entidades publicadoras · ${formatNumber(totalDatasets)} datasets agregados.`}
      />

      <Card className="mb-4">
        <div className="p-3 flex flex-wrap items-center gap-3">
          <label className="flex-1 min-w-[200px] inline-flex items-center gap-2 h-9 rounded-md border border-[var(--border-soft)] px-3 bg-[var(--surface-1)]">
            <Search size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
            <input
              type="search"
              placeholder="Filtrar — CONEVAL, IPN, SESNSP…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--text-strong)] focus:outline-none"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
            Ordenar
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-8 px-2 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-[var(--text-strong)]"
            >
              <option value="popular">Más publicadoras</option>
              <option value="alpha">Alfabético</option>
              <option value="recent">Más recientes</option>
            </select>
          </label>
          <span className="text-[11px] mono text-[var(--text-muted)]">
            {formatNumber(orgs.length)} / {formatNumber(total)}
          </span>
        </div>
      </Card>

      {orgs.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin resultados"
            description={q ? "Prueba con otro término." : "El pipeline aún no ha sincronizado organizaciones."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orgs.map((o) => (
            <Link
              key={o.slug}
              to={`/datasets?organization=${encodeURIComponent(o.slug)}`}
              className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="flex justify-between items-baseline gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-strong)] line-clamp-2 leading-snug">
                  {o.title}
                </h2>
                <span className="text-[11px] mono text-[var(--text-muted)] shrink-0">
                  {formatNumber(o.dataset_count)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3 min-h-[3.25rem]">
                {truncate(o.description, 200) || "Sin descripción."}
              </p>
              <div className="mt-3 text-[10px] mono text-[var(--text-muted)] flex justify-between">
                <span>{o.slug}</span>
                <span>creada {formatDate(o.created)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
