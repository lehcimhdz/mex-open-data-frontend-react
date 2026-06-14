import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories, useSearch } from "../api/hooks";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { formatDate, formatNumber, truncate } from "../lib/format";

export default function SearchPage() {
  const cats = useCategories();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const { data, isFetching, error } = useSearch(query, {
    category: category || undefined,
    format: format || undefined,
    limit: 50,
  });

  return (
    <div>
      <PageHeader
        title="Búsqueda"
        subtitle="Encuentra datasets por palabras clave. Puedes acotar por categoría y formato del recurso."
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
      >
        <label className="md:col-span-6 text-sm">
          <span className="block text-xs font-medium text-slate-500 mb-1">
            Texto a buscar
          </span>
          <input
            type="search"
            placeholder="ej: incidencia delictiva"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <label className="md:col-span-3 text-sm">
          <span className="block text-xs font-medium text-slate-500 mb-1">
            Categoría
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
          >
            <option value="">Todas</option>
            {(cats.data ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-3 text-sm">
          <span className="block text-xs font-medium text-slate-500 mb-1">
            Formato
          </span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
          >
            <option value="">Cualquiera</option>
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
            <option value="json">JSON</option>
            <option value="zip">ZIP</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
      </form>

      {error ? <ErrorBox error={error} /> : null}
      {isFetching ? <Loader /> : null}
      {data ? (
        <>
          <div className="text-sm text-slate-500 mb-3">
            {formatNumber(data.length)} resultado(s) para {JSON.stringify(query)}
          </div>
          <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {data.map((d) => (
              <li key={d.slug} className="p-4 hover:bg-slate-50">
                <Link to={`/datasets/${d.slug}`} className="block">
                  <div className="flex justify-between gap-3 items-baseline">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {d.title}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {formatDate(d.last_updated)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {truncate(d.description, 220) || "Sin descripción."}
                  </p>
                  <div className="mt-2 text-xs text-slate-500 flex gap-2 flex-wrap">
                    <span className="font-mono">{d.slug}</span>
                    {d.category_slug ? (
                      <span>· {d.category_name ?? d.category_slug}</span>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
            {data.length === 0 ? (
              <li className="p-6 text-center text-sm text-slate-500">
                Sin coincidencias.
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
    </div>
  );
}
