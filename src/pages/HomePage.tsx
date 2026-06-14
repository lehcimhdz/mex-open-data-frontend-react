import { Link } from "react-router-dom";
import { ArrowRight, Tags, Building2, Clock4, FileText } from "lucide-react";
import { useCategories, useDatasetList, useStats } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { KPI } from "../ui/kpi";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { CategoryTreemap } from "../components/CategoryTreemap";
import { Button } from "../ui/button";
import { Card, CardBody, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { formatNumber, formatDate, truncate } from "../lib/format";

export default function HomePage() {
  const cats = useCategories();
  const stats = useStats();
  const recent = useDatasetList({ sort: "recent", limit: 10 });

  if (cats.isLoading || stats.isLoading)
    return (
      <PageShell width="wide">
        <Loader />
      </PageShell>
    );
  if (cats.error)
    return (
      <PageShell width="wide">
        <ErrorBox error={cats.error} />
      </PageShell>
    );

  const categories = cats.data ?? [];
  const s = stats.data;

  return (
    <PageShell width="wide">
      <PageHero
        kicker="datos.gob.mx"
        title={
          <>
            Datos abiertos del gobierno de México,
            <br className="hidden sm:inline" /> explorables sin trámite.
          </>
        }
        subtitle="Catálogos, esquemas y archivos publicados por instituciones federales, organizados para curiosos, periodistas y analistas."
      />

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <KPI
          label="Datasets"
          value={formatNumber(s?.datasets ?? 0)}
          helper={`${formatNumber(s?.fresh_30d ?? 0)} en los últimos 30 d`}
        />
        <KPI
          label="Categorías"
          value={formatNumber(s?.categories ?? categories.length)}
          helper="Temas activos"
        />
        <KPI
          label="Organizaciones"
          value={formatNumber(s?.organizations ?? 0)}
          helper="Instituciones publicadoras"
        />
        <KPI
          label="Última actualización"
          value={s?.latest_update ? formatDate(s.latest_update) : "—"}
          helper={`${formatNumber(s?.resources ?? 0)} recursos en total`}
          tone="accent"
        />
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3 gap-3">
          <h2 className="text-base font-semibold text-[var(--text-strong)] serif">
            Mapa del catálogo
          </h2>
          <Link
            to="/categorias"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] inline-flex items-center gap-1"
          >
            Todas las categorías <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-2xl">
          Cada rectángulo es una categoría temática; su tamaño es proporcional
          al número de datasets publicados. La más grande lleva acento.
        </p>
        <CategoryTreemap categories={categories} />
      </section>

      <section className="mb-10">
        <Card>
          <CardHeader
            title="Recientemente actualizados"
            subtitle="Los 10 datasets cuya última edición es más reciente en el catálogo"
            actions={
              <Link
                to="/datasets?sort=recent"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-strong)] inline-flex items-center gap-1"
              >
                Ver más <ArrowRight size={12} aria-hidden="true" />
              </Link>
            }
          />
          <CardBody className="p-0">
            {recent.isLoading ? (
              <div className="p-4 flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recent.error || !recent.data?.data?.length ? (
              <div className="px-4 py-6 text-sm text-[var(--text-muted)]">
                Sin datos recientes todavía.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-soft)]">
                {recent.data.data.map((d) => (
                  <li key={d.slug}>
                    <Link
                      to={`/datasets/${d.slug}`}
                      className="px-4 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <span className="flex-1 min-w-[180px] text-sm font-medium text-[var(--text-strong)] truncate">
                        {d.title}
                      </span>
                      <span className="text-[11px] mono text-[var(--text-muted)] shrink-0">
                        {formatDate(d.last_updated)}
                      </span>
                      <span className="basis-full text-[11px] mono text-[var(--text-muted)] flex gap-2 truncate">
                        <span className="truncate">{d.slug}</span>
                        {d.category_slug ? (
                          <span>· {d.category_name ?? d.category_slug}</span>
                        ) : null}
                        {d.organization ? (
                          <span className="truncate">· {truncate(d.organization, 40)}</span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <Card>
          <CardHeader title="Categorías más ricas" subtitle="Por número de datasets" />
          <CardBody className="p-0">
            <ul className="divide-y divide-[var(--border-soft)]">
              {(s?.top_categories ?? []).map((c, i) => (
                <li key={c.slug}>
                  <Link
                    to={`/categorias/${c.slug}`}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-[var(--surface-2)]"
                  >
                    <span className="w-5 text-[11px] mono text-[var(--text-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-[var(--text-strong)] truncate">
                      {c.name}
                    </span>
                    <span className="text-xs mono text-[var(--text-muted)]">
                      {formatNumber(c.count)}
                    </span>
                  </Link>
                </li>
              ))}
              {(s?.top_categories ?? []).length === 0 ? (
                <li className="px-4 py-3 text-xs text-[var(--text-muted)]">
                  Pendiente — corre el pipeline para llenar la BD.
                </li>
              ) : null}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Top organizaciones"
            subtitle="Las instituciones que más publican"
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-[var(--border-soft)]">
              {(s?.top_organizations ?? []).map((o, i) => (
                <li key={o.slug}>
                  <Link
                    to={`/datasets?organization=${encodeURIComponent(o.slug)}`}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-[var(--surface-2)]"
                  >
                    <span className="w-5 text-[11px] mono text-[var(--text-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-[var(--text-strong)] truncate">
                      {o.name}
                    </span>
                    <span className="text-xs mono text-[var(--text-muted)]">
                      {formatNumber(o.count)}
                    </span>
                  </Link>
                </li>
              ))}
              {(s?.top_organizations ?? []).length === 0 ? (
                <li className="px-4 py-3 text-xs text-[var(--text-muted)]">
                  Pendiente — el pipeline aún no sincronizó organizaciones.
                </li>
              ) : null}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        {[
          {
            label: "Por tema",
            icon: <Tags size={18} aria-hidden="true" />,
            to: "/categorias",
            desc: "Recorre las 28 áreas temáticas en las que se organiza la información pública.",
          },
          {
            label: "Por organización",
            icon: <Building2 size={18} aria-hidden="true" />,
            to: "/organizaciones",
            desc: "Filtra por institución publicadora: CONEVAL, SESNSP, IPN, …",
          },
          {
            label: "Por recencia",
            icon: <Clock4 size={18} aria-hidden="true" />,
            to: "/datasets?sort=recent",
            desc: "Datasets actualizados más recientemente por sus instituciones.",
          },
        ].map((tile) => (
          <Link
            key={tile.label}
            to={tile.to}
            className="group rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)] group-hover:text-[var(--text-strong)]">
                {tile.icon}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--text-strong)] inline-flex items-center gap-1">
                  Explora {tile.label}{" "}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)]" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">{tile.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 flex flex-wrap items-center gap-4">
        <FileText size={20} className="text-[var(--text-muted)]" aria-hidden="true" />
        <div className="flex-1 min-w-[260px]">
          <h3 className="text-sm font-semibold text-[var(--text-strong)]">
            ¿Buscas un dataset específico?
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            La búsqueda full-text y los filtros viven en{" "}
            <code className="mono text-[var(--text-default)]">/datasets</code>. O abre la paleta de comandos con{" "}
            <kbd className="mono text-[var(--text-default)]">⌘K</kbd>.
          </p>
        </div>
        <Button asChild rightIcon={<ArrowRight size={14} aria-hidden="true" />}>
          <Link to="/datasets">Ir a datasets</Link>
        </Button>
      </section>
    </PageShell>
  );
}
