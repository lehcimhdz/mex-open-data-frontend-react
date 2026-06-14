import { Link } from "react-router-dom";
import { useCategories } from "../api/hooks";
import { PageHeader } from "../components/PageHeader";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { formatNumber, truncate } from "../lib/format";

export default function CategoriesPage() {
  const { data, isLoading, error } = useCategories();
  if (isLoading) return <Loader />;
  if (error) return <ErrorBox error={error} />;
  const categories = [...(data ?? [])].sort(
    (a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0)
  );

  return (
    <div>
      <PageHeader
        title="Categorías"
        subtitle={`Las ${categories.length} categorías temáticas en las que se organiza la información pública.`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/categories/${c.slug}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-600 hover:shadow-md transition"
          >
            <div className="flex justify-between items-baseline">
              <h2 className="text-base font-semibold text-slate-900">{c.name}</h2>
              <span className="text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded-full">
                {formatNumber(c.dataset_count ?? 0)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 line-clamp-3">
              {truncate(c.description, 160) || "Sin descripción."}
            </p>
            <div className="mt-3 text-xs text-slate-400 font-mono">{c.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
