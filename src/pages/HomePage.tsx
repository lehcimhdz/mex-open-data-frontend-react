import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCategories } from "../api/hooks";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { formatNumber } from "../lib/format";

export default function HomePage() {
  const { data, isLoading, error } = useCategories();

  if (isLoading) return <Loader label="Cargando catálogo..." />;
  if (error) return <ErrorBox error={error} />;
  const categories = data ?? [];

  const totalDatasets = categories.reduce((s, c) => s + (c.dataset_count ?? 0), 0);
  const chartData = [...categories]
    .sort((a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0))
    .map((c) => ({ name: c.name, datasets: c.dataset_count ?? 0, slug: c.slug }));

  return (
    <div>
      <PageHeader
        title="Open Data México · Explorer"
        subtitle="Explora todas las categorías y datasets que publica el gobierno de México en datos.gob.mx, con tableros analíticos y modelos de Machine Learning incluidos."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Categorías" value={formatNumber(categories.length)} />
        <StatCard
          label="Datasets totales"
          value={formatNumber(totalDatasets)}
          tone="good"
        />
        <StatCard
          label="Categoría más rica"
          value={chartData[0]?.name ?? "—"}
          helper={`${formatNumber(chartData[0]?.datasets ?? 0)} datasets`}
        />
        <StatCard
          label="Categoría más nueva"
          value={chartData[chartData.length - 1]?.name ?? "—"}
          helper={`${formatNumber(chartData[chartData.length - 1]?.datasets ?? 0)} datasets`}
        />
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-4 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Datasets por categoría
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Cantidad de conjuntos de datos publicados por categoría temática. Pasa el
          cursor para ver el conteo exacto.
        </p>
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 80, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={140} stroke="#64748b" />
              <Tooltip
                formatter={(v: number) => formatNumber(v)}
                labelFormatter={(l) => String(l)}
              />
              <Bar dataKey="datasets" fill="#059669" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Saltar a una categoría
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {chartData.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              to={`/categories/${c.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-brand-600 hover:shadow transition"
            >
              <div className="text-sm font-medium text-slate-900">{c.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatNumber(c.datasets)} datasets
              </div>
            </Link>
          ))}
        </div>
        <div className="text-right mt-3">
          <Link to="/categories" className="text-sm text-brand-700 hover:underline">
            Ver todas las categorías →
          </Link>
        </div>
      </section>
    </div>
  );
}
