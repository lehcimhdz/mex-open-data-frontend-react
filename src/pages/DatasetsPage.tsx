import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { useCategories, useSearch } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { Tag } from "../ui/tag";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { formatDate, formatNumber, truncate } from "../lib/format";

const FORMATS = ["csv", "xlsx", "json", "zip", "pdf"];

export default function DatasetsPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("category") ?? "";
  const initialFmt = params.get("format") ?? "";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [format, setFormat] = useState(initialFmt);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("category", category);
    if (format) next.set("format", format);
    setParams(next, { replace: true });
  }, [q, category, format, setParams]);

  const categories = useCategories();
  const search = useSearch(q, {
    category: category || undefined,
    format: format || undefined,
    limit: 50,
  });

  const datasets = useMemo(() => search.data ?? [], [search.data]);

  return (
    <PageShell width="wide">
      <PageHero
        kicker="catálogo · búsqueda"
        title="Datasets"
        subtitle="Encuentra datasets por texto, categoría o formato. Los filtros viven en la URL — comparte el link y conservan estado."
      />

      <Card className="mb-6">
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-6 text-sm">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Texto
            </span>
            <input
              type="search"
              placeholder="ej. incidencia delictiva, rezago, pesca…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-sm text-[var(--text-strong)] focus:border-[var(--color-accent-500)] focus:outline-none"
            />
          </label>
          <label className="md:col-span-3 text-sm">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Categoría
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-sm text-[var(--text-strong)]"
            >
              <option value="">Todas</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-3 text-sm">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Formato
            </span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-sm text-[var(--text-strong)]"
            >
              <option value="">Cualquiera</option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(q || category || format) ? (
          <div className="px-4 pb-4 pt-0 flex flex-wrap gap-2 items-center">
            <Filter size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
            {q ? <Chip label={`q: ${q}`} onRemove={() => setQ("")} /> : null}
            {category ? (
              <Chip label={`categoría: ${category}`} onRemove={() => setCategory("")} />
            ) : null}
            {format ? <Chip label={`formato: ${format}`} onRemove={() => setFormat("")} /> : null}
          </div>
        ) : null}
      </Card>

      {search.error ? <ErrorBox error={search.error} /> : null}
      {search.isFetching ? <Loader /> : null}

      {!search.isFetching && !search.error ? (
        <Card>
          {q ? (
            <div className="px-4 py-3 border-b border-[var(--border-soft)] text-xs text-[var(--text-muted)]">
              {formatNumber(datasets.length)} resultados para {JSON.stringify(q)}
              {category ? <> · en <span className="mono">{category}</span></> : null}
              {format ? <> · formato <span className="mono">{format}</span></> : null}
            </div>
          ) : null}
          {datasets.length ? (
            <ul className="divide-y divide-[var(--border-soft)]">
              {datasets.map((d) => (
                <li key={d.slug}>
                  <Link
                    to={`/datasets/${d.slug}`}
                    className="block px-4 py-3 hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <div className="flex justify-between gap-3 items-baseline">
                      <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate">
                        {d.title}
                      </h3>
                      <span className="text-xs text-[var(--text-muted)] mono shrink-0">
                        {formatDate(d.last_updated)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                      {truncate(d.description, 240) || "Sin descripción."}
                    </p>
                    <div className="mt-2 text-[11px] mono text-[var(--text-muted)] flex gap-2 flex-wrap">
                      <span>{d.slug}</span>
                      {d.category_slug ? (
                        <span>· {d.category_name ?? d.category_slug}</span>
                      ) : null}
                      {d.organization || d.organization_name ? (
                        <span>· {d.organization ?? d.organization_name}</span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={q ? "Sin coincidencias" : "Empieza tu búsqueda"}
              description={
                q
                  ? "Prueba con menos términos o relaja los filtros."
                  : "Escribe en la caja de texto, o filtra por categoría/formato. Los resultados aparecen aquí."
              }
            />
          )}
        </Card>
      ) : null}
    </PageShell>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Tag variant="accent" className="cursor-default">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${label}`}
        className="ml-1 inline-flex items-center justify-center rounded-full hover:bg-[var(--color-accent-100)] dark:hover:bg-[var(--color-accent-700)] h-4 w-4"
      >
        <X size={10} aria-hidden="true" />
      </button>
    </Tag>
  );
}
