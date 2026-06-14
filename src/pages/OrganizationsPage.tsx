import { Building2 } from "lucide-react";
import { useOrganizations } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { formatDate, formatNumber, truncate } from "../lib/format";
import { ApiError } from "../api/client";
import { EmptyState } from "../ui/empty-state";
import { Card } from "../ui/card";

export default function OrganizationsPage() {
  const { data, isLoading, error } = useOrganizations();

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
          <PageHero title="Organizaciones" subtitle="Las instituciones que publican datos." />
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

  const orgs = [...(data ?? [])].sort(
    (a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0)
  );

  return (
    <PageShell width="wide">
      <PageHero
        kicker="catálogo · instituciones"
        title="Organizaciones"
        subtitle={`${formatNumber(orgs.length)} entidades publicadoras de datos abiertos.`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {orgs.map((o) => (
          <Card
            key={o.slug}
            className="p-4 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <div className="flex justify-between items-baseline gap-2">
              <h2 className="text-sm font-semibold text-[var(--text-strong)] truncate">
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
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
