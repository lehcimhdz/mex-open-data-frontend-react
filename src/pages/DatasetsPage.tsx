import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import { useCategories, useDatasetList, useSearch } from "../api/hooks";
import { apiGetWithHeaders } from "../api/client";
import { PageHero, PageShell } from "../ui/page";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { Tag } from "../ui/tag";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { formatDate, formatNumber, truncate } from "../lib/format";
import type { Dataset } from "../api/types";

const FORMATS = ["csv", "xlsx", "json", "zip", "pdf"];
const PAGE_SIZE = 100;
const ROW_HEIGHT = 64;

type Sort = "recent" | "title" | "slug";

export default function DatasetsPage() {
  const [params, setParams] = useSearchParams();
  const initial = useMemo(
    () => ({
      q: params.get("q") ?? "",
      category: params.get("category") ?? "",
      format: params.get("format") ?? "",
      organization: params.get("organization") ?? "",
      sort: (params.get("sort") as Sort) ?? "recent",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [q, setQ] = useState(initial.q);
  const [category, setCategory] = useState(initial.category);
  const [format, setFormat] = useState(initial.format);
  const [organization, setOrganization] = useState(initial.organization);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("category", category);
    if (format) next.set("format", format);
    if (organization) next.set("organization", organization);
    if (sort !== "recent") next.set("sort", sort);
    setParams(next, { replace: true });
    setPage(0);
  }, [q, category, format, organization, sort, setParams]);

  const categories = useCategories();

  const usingSearch = q.trim().length > 0;
  const searchQ = useSearch(usingSearch ? q : "", {
    category: category || undefined,
    format: format || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
  const listQ = useDatasetList(
    !usingSearch
      ? {
          category: category || undefined,
          organization: organization || undefined,
          format: format || undefined,
          sort,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        }
      : { limit: 0 }
  );

  const searchHeadersQ = useQuery({
    queryKey: ["search-headers", q, category, format, page],
    queryFn: () =>
      apiGetWithHeaders<Dataset[]>("/search", {
        q,
        category: category || undefined,
        format: format || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: usingSearch,
  });

  const rows = usingSearch ? searchQ.data ?? [] : listQ.data?.data ?? [];
  const totalCount = usingSearch
    ? searchHeadersQ.data?.totalCount ?? rows.length
    : listQ.data?.totalCount ?? rows.length;
  const isFetching = usingSearch
    ? searchQ.isFetching || searchHeadersQ.isFetching
    : listQ.isFetching;
  const error = usingSearch ? searchQ.error : listQ.error;

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE));
  const hasFilters = !!(q || category || format || organization || sort !== "recent");

  return (
    <PageShell width="wide">
      <PageHero
        kicker="catálogo · datasets"
        title="Datasets"
        subtitle="Recorre todos los datasets indexados. La búsqueda full-text y los filtros conservan estado en la URL para que puedas compartir el link."
      />

      <Card className="mb-4">
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Texto
            </span>
            <input
              type="search"
              placeholder="ej. incidencia, rezago, agua…"
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
          <label className="md:col-span-2 text-sm">
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
          <label className="md:col-span-2 text-sm">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Ordenar
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              disabled={usingSearch}
              className="w-full h-9 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-sm text-[var(--text-strong)] disabled:opacity-50"
            >
              <option value="recent">Más recientes</option>
              <option value="title">Título</option>
              <option value="slug">Slug</option>
            </select>
          </label>
          <label className="md:col-span-1 text-sm">
            <span className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Org
            </span>
            <input
              type="text"
              placeholder="slug"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              disabled={usingSearch}
              className="w-full h-9 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] text-sm text-[var(--text-strong)] disabled:opacity-50"
            />
          </label>
        </div>
        {hasFilters ? (
          <div className="px-4 pb-4 flex flex-wrap gap-2 items-center">
            <Filter size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
            {q ? <Chip label={`q: ${q}`} onRemove={() => setQ("")} /> : null}
            {category ? (
              <Chip label={`categoría: ${category}`} onRemove={() => setCategory("")} />
            ) : null}
            {format ? <Chip label={`formato: ${format}`} onRemove={() => setFormat("")} /> : null}
            {organization ? (
              <Chip label={`org: ${organization}`} onRemove={() => setOrganization("")} />
            ) : null}
            {sort !== "recent" ? (
              <Chip label={`orden: ${sort}`} onRemove={() => setSort("recent")} />
            ) : null}
            {usingSearch ? (
              <span className="text-[10px] mono text-[var(--text-muted)] ml-auto">
                (orden/org desactivado mientras hay búsqueda full-text)
              </span>
            ) : null}
          </div>
        ) : null}
      </Card>

      {error ? <ErrorBox error={error} /> : null}
      {isFetching && rows.length === 0 ? <Loader /> : null}

      {!error && rows.length === 0 && !isFetching ? (
        <Card>
          <EmptyState
            title={hasFilters ? "Sin coincidencias" : "Catálogo vacío"}
            description={
              hasFilters
                ? "Quita filtros o intenta otra búsqueda."
                : "El pipeline aún no ha cargado datasets en este backend."
            }
          />
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2 px-1">
            <span>
              {formatNumber(totalCount)} resultados · página{" "}
              <span className="mono">{page + 1}</span> de{" "}
              <span className="mono">{formatNumber(totalPages)}</span>
            </span>
            <Pager page={page} totalPages={totalPages} onChange={setPage} />
          </div>
          <VirtualList rows={rows} />
          <div className="flex items-center justify-end text-xs text-[var(--text-muted)] mt-3 px-1">
            <Pager page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
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

function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label="Página anterior"
        leftIcon={<ChevronLeft size={12} aria-hidden="true" />}
      >
        Anterior
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        aria-label="Página siguiente"
        rightIcon={<ChevronRight size={12} aria-hidden="true" />}
      >
        Siguiente
      </Button>
    </span>
  );
}

function VirtualList({ rows }: { rows: Dataset[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const v = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => parentRef.current,
    overscan: 12,
  });

  return (
    <div
      ref={parentRef}
      className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] overflow-auto"
      style={{ height: "min(75vh, 720px)" }}
    >
      <div style={{ height: v.getTotalSize(), position: "relative" }}>
        {v.getVirtualItems().map((vi) => {
          const d = rows[vi.index];
          return (
            <div
              key={vi.key}
              data-index={vi.index}
              ref={v.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${vi.start}px)`,
              }}
            >
              <Link
                to={`/datasets/${d.slug}`}
                className="block px-4 py-3 border-b border-[var(--border-soft)] hover:bg-[var(--surface-2)] transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex justify-between gap-3 items-baseline">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate">
                    {d.title}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] mono shrink-0">
                    {formatDate(d.last_updated)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] mono text-[var(--text-muted)] flex gap-2 flex-wrap items-baseline">
                  <span className="truncate">{d.slug}</span>
                  {d.category_slug ? (
                    <span>· {d.category_name ?? d.category_slug}</span>
                  ) : null}
                  {d.organization ? (
                    <span className="truncate">· {truncate(d.organization, 40)}</span>
                  ) : null}
                  <span>· {formatNumber(d.resource_count ?? 0)} recursos</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
