import { useOrganizations } from "../api/hooks";
import { Loader } from "../components/Loader";
import { PageHeader } from "../components/PageHeader";
import { formatDate, formatNumber, truncate } from "../lib/format";
import { ApiError } from "../api/client";

export default function OrganizationsPage() {
  const { data, isLoading, error } = useOrganizations();

  if (isLoading) return <Loader />;

  if (error) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 404) {
      return (
        <div>
          <PageHeader
            title="Organizaciones"
            subtitle="Las instituciones que publican datos."
          />
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Tu backend FastAPI aún no expone <code>/organizations</code>. Está
            previsto en el spec <code>02_backend.md</code>. Mientras tanto puedes
            llamar la librería directamente con{" "}
            <code className="font-mono">open-data-mx organizations</code>.
          </div>
        </div>
      );
    }
    return (
      <div>
        <PageHeader title="Organizaciones" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error instanceof Error ? error.message : "Error desconocido"}
        </div>
      </div>
    );
  }

  const orgs = [...(data ?? [])].sort(
    (a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0)
  );

  return (
    <div>
      <PageHeader
        title="Organizaciones"
        subtitle={`${formatNumber(orgs.length)} instituciones publicadoras.`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {orgs.map((o) => (
          <article
            key={o.slug}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-600 transition"
          >
            <div className="flex justify-between items-baseline gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                {o.title}
              </h2>
              <span className="text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded-full">
                {formatNumber(o.dataset_count)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 line-clamp-3">
              {truncate(o.description, 200) || "Sin descripción."}
            </p>
            <div className="mt-3 text-xs text-slate-400 font-mono">
              {o.slug} · creada {formatDate(o.created)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
