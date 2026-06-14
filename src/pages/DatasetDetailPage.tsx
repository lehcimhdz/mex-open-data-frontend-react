import { Link, useParams } from "react-router-dom";
import { useDataset } from "../api/hooks";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { formatBytes, formatDate, formatNumber } from "../lib/format";

const FORMAT_COLORS: Record<string, string> = {
  csv: "bg-emerald-100 text-emerald-700",
  xls: "bg-amber-100 text-amber-700",
  xlsx: "bg-amber-100 text-amber-700",
  zip: "bg-slate-200 text-slate-700",
  pdf: "bg-red-100 text-red-700",
  json: "bg-sky-100 text-sky-700",
};

export default function DatasetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useDataset(slug);
  if (isLoading) return <Loader />;
  if (error) return <ErrorBox error={error} />;
  if (!data) return null;

  const csvRes = data.resources.find((r) => (r.format || "").toLowerCase() === "csv");

  return (
    <div>
      <PageHeader
        title={data.title}
        subtitle={data.description ?? undefined}
        actions={
          <>
            {csvRes ? (
              <Link
                to={`/datasets/${slug}/eda`}
                className="text-sm px-3 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
              >
                Abrir EDA
              </Link>
            ) : null}
            {csvRes ? (
              <Link
                to={`/datasets/${slug}/ml`}
                className="text-sm px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700"
              >
                Insights ML
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Slug" value={data.slug} />
        <StatCard
          label="Categoría"
          value={
            data.category_name ? (
              <Link
                to={`/categories/${data.category_slug}`}
                className="text-brand-700 hover:underline"
              >
                {data.category_name}
              </Link>
            ) : (
              data.category_slug ?? "—"
            )
          }
        />
        <StatCard
          label="Organización"
          value={data.organization ?? data.organization_name ?? "—"}
        />
        <StatCard label="Última actualización" value={formatDate(data.last_updated)} />
      </div>

      {data.tags && data.tags.length ? (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Etiquetas
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Recursos ({formatNumber(data.resources.length)})
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {data.resources.map((r) => {
            const fmt = (r.format || "").toLowerCase();
            const colour = FORMAT_COLORS[fmt] ?? "bg-slate-100 text-slate-700";
            return (
              <li key={r.resource_id} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between gap-4 items-baseline">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${colour}`}>
                      {fmt || "?"}
                    </span>
                    <span className="font-medium text-slate-900">
                      {r.name ?? r.resource_id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatBytes(r.file_size)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex gap-3 flex-wrap">
                  <span className="font-mono">{r.resource_id}</span>
                  {r.download_url ? (
                    <a
                      className="text-brand-700 hover:underline"
                      href={r.download_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Descargar →
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
          {data.resources.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">
              Este dataset no tiene recursos cargados todavía.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
