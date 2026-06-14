import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { useCategories } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { formatNumber, truncate } from "../lib/format";
import { IconButton } from "../ui/icon-button";

type View = "grid" | "table";

export default function CategoriesPage() {
  const { data, isLoading, error } = useCategories();
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<"count" | "name" | "slug">("count");

  const categories = useMemo(() => {
    const arr = [...(data ?? [])];
    if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "es"));
    else if (sort === "slug") arr.sort((a, b) => a.slug.localeCompare(b.slug));
    else arr.sort((a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0));
    return arr;
  }, [data, sort]);

  if (isLoading)
    return (
      <PageShell width="wide">
        <Loader />
      </PageShell>
    );
  if (error)
    return (
      <PageShell width="wide">
        <ErrorBox error={error} />
      </PageShell>
    );

  const maxCount = Math.max(1, ...categories.map((c) => c.dataset_count ?? 0));

  return (
    <PageShell width="wide">
      <PageHero
        kicker="catálogo · 28 temas"
        title="Categorías"
        subtitle="Las áreas temáticas en las que las instituciones organizan su información pública."
        actions={
          <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={`h-7 px-2 inline-flex items-center gap-1 rounded text-xs ${
                view === "grid"
                  ? "bg-[var(--color-ink-9)] text-[var(--color-ink-0)] dark:bg-[var(--color-night-9)] dark:text-[var(--color-night-0)]"
                  : "text-[var(--text-default)]"
              }`}
            >
              <LayoutGrid size={12} /> Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              className={`h-7 px-2 inline-flex items-center gap-1 rounded text-xs ${
                view === "table"
                  ? "bg-[var(--color-ink-9)] text-[var(--color-ink-0)] dark:bg-[var(--color-night-9)] dark:text-[var(--color-night-0)]"
                  : "text-[var(--text-default)]"
              }`}
            >
              <TableIcon size={12} /> Tabla
            </button>
          </div>
        }
      />

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => {
            const pct = ((c.dataset_count ?? 0) / maxCount) * 100;
            return (
              <Link
                key={c.slug}
                to={`/categorias/${c.slug}`}
                className="group rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-accent-500)] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate">
                    {c.name}
                  </h3>
                  <span className="text-[11px] mono text-[var(--text-muted)] shrink-0">
                    {formatNumber(c.dataset_count ?? 0)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[var(--surface-3)] mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent-500)] group-hover:bg-[var(--color-accent-600)] transition-colors"
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3 line-clamp-2 min-h-[2.25rem]">
                  {truncate(c.description, 140) || "Sin descripción."}
                </p>
                <div className="text-[10px] mono text-[var(--text-muted)] mt-2">{c.slug}</div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="text-left px-4 py-2.5 cursor-pointer" onClick={() => setSort("name")}>
                  Nombre
                </th>
                <th className="text-left px-4 py-2.5 cursor-pointer" onClick={() => setSort("slug")}>
                  Slug
                </th>
                <th className="text-right px-4 py-2.5 cursor-pointer" onClick={() => setSort("count")}>
                  Datasets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {categories.map((c) => (
                <tr
                  key={c.slug}
                  className="hover:bg-[var(--surface-2)] cursor-pointer"
                  onClick={() => (window.location.href = `/categorias/${c.slug}`)}
                >
                  <td className="px-4 py-2.5 text-[var(--text-strong)] font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 mono text-xs text-[var(--text-muted)]">{c.slug}</td>
                  <td className="px-4 py-2.5 text-right numeric">{formatNumber(c.dataset_count ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
