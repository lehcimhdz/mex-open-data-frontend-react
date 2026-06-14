import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCategory, useCategoryDatasets } from "../api/hooks";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { formatDate, formatNumber, truncate } from "../lib/format";

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cat = useCategory(slug);
  const [limit, setLimit] = useState(50);
  const datasets = useCategoryDatasets(slug, { limit });

  if (cat.isLoading || datasets.isLoading) return <Loader />;
  if (cat.error) return <ErrorBox error={cat.error} />;
  if (datasets.error) return <ErrorBox error={datasets.error} />;

  const list = datasets.data ?? [];
  // Pseudo histogram: number of resources per dataset
  const histo = list
    .map((d) => d.resource_count ?? 0)
    .reduce<Record<string, number>>((acc, n) => {
      const bin = n === 0 ? "0" : n === 1 ? "1" : n <= 4 ? "2-4" : n <= 9 ? "5-9" : "10+";
      acc[bin] = (acc[bin] ?? 0) + 1;
      return acc;
    }, {});
  const histoData = ["0", "1", "2-4", "5-9", "10+"].map((bin) => ({
    bin,
    count: histo[bin] ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title={cat.data?.name ?? slug ?? "Categoría"}
        subtitle={cat.data?.description ?? undefined}
        actions={
          <Link
            to="/categories"
            className="text-sm text-brand-700 hover:underline px-3 py-2"
          >
            ← Volver
          </Link>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Slug" value={cat.data?.slug ?? slug ?? "—"} />
        <StatCard
          label="Datasets en categoría"
          value={formatNumber(cat.data?.dataset_count ?? list.length)}
          tone="good"
        />
        <StatCard
          label="Mostrando"
          value={formatNumber(list.length)}
          helper={`Límite actual: ${limit}`}
        />
        <StatCard
          label="Última actualización"
          value={formatDate(cat.data?.updated_at)}
        />
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Distribución de recursos por dataset
        </h2>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={histoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bin" stroke="#64748b" />
              <YAxis stroke="#64748b" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Datasets</h2>
          <div className="flex gap-2 items-center text-xs">
            <span className="text-slate-500">Mostrar:</span>
            {[20, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-2 py-1 rounded ${
                  limit === n
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {list.map((d) => (
            <li key={d.slug} className="p-4 hover:bg-slate-50">
              <Link to={`/datasets/${d.slug}`} className="block">
                <div className="flex justify-between gap-4 items-baseline">
                  <h3 className="text-sm font-semibold text-slate-900">{d.title}</h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(d.last_updated)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {truncate(d.description, 240) || "Sin descripción."}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                  <span className="font-mono">{d.slug}</span>
                  {d.organization || d.organization_name ? (
                    <span>· {d.organization ?? d.organization_name}</span>
                  ) : null}
                  <span>· {formatNumber(d.resource_count ?? 0)} recursos</span>
                </div>
              </Link>
            </li>
          ))}
          {list.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">
              No hay datasets cargados en el backend para esta categoría todavía.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
