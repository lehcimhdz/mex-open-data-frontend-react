import { Link } from "react-router-dom";
import { ArrowRight, Tags, Building2, Clock4, FileText } from "lucide-react";
import { useCategories } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { KPI } from "../ui/kpi";
import { Sparkline } from "../ui/sparkline";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { CategoryTreemap } from "../components/CategoryTreemap";
import { Button } from "../ui/button";
import { formatNumber, formatDate } from "../lib/format";

function fakeSparkline(seed: number, length = 24): number[] {
  // Deterministic pseudo-random sparkline so the home doesn't look static.
  let s = seed >>> 0 || 1;
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out.push((s % 1000) / 1000);
  }
  return out;
}

export default function HomePage() {
  const { data, isLoading, error } = useCategories();

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

  const categories = data ?? [];
  const sorted = [...categories].sort(
    (a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0)
  );
  const totalDatasets = categories.reduce((s, c) => s + (c.dataset_count ?? 0), 0);
  const totalCategories = categories.length;
  const latestUpdate = categories
    .map((c) => (c.updated_at ? new Date(c.updated_at).getTime() : 0))
    .reduce((m, t) => Math.max(m, t), 0);

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
          value={formatNumber(totalDatasets)}
          helper="Indexados ahora"
          chart={<Sparkline values={fakeSparkline(totalDatasets)} stroke="var(--viz-quiet)" />}
        />
        <KPI
          label="Categorías"
          value={formatNumber(totalCategories)}
          helper="Temas activos"
          chart={<Sparkline values={fakeSparkline(totalCategories + 17)} stroke="var(--viz-quiet)" />}
        />
        <KPI
          label="Top categoría"
          value={sorted[0]?.name ?? "—"}
          helper={`${formatNumber(sorted[0]?.dataset_count ?? 0)} datasets`}
          tone="accent"
          chart={<Sparkline values={fakeSparkline((sorted[0]?.dataset_count ?? 1) + 3)} stroke="var(--color-accent-600)" />}
        />
        <KPI
          label="Última actualización"
          value={latestUpdate ? formatDate(new Date(latestUpdate).toISOString()) : "—"}
          helper="En el catálogo"
          chart={<Sparkline values={fakeSparkline(latestUpdate || 42)} stroke="var(--viz-quiet)" />}
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
          al número de datasets publicados. Click para entrar.
        </p>
        <CategoryTreemap categories={categories} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        {[
          {
            label: "Por tema",
            icon: <Tags size={18} aria-hidden="true" />,
            to: "/categorias",
            desc: "Recorre los 28 temas en los que se organiza la información pública.",
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
            className="group rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 hover:border-[var(--border-strong)] transition-colors"
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

      <section className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--text-strong)] serif">
            Saltos rápidos
          </h2>
          <span className="text-xs text-[var(--text-muted)] mono">
            ⌘K para buscar
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {sorted.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              to={`/categorias/${c.slug}`}
              className="group block rounded-md border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-2.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-[var(--text-strong)] truncate">
                  {c.name}
                </span>
                <span className="text-[10px] mono text-[var(--text-muted)]">
                  {formatNumber(c.dataset_count ?? 0)}
                </span>
              </div>
              <div className="text-[10px] mono text-[var(--text-muted)] mt-0.5 truncate">
                {c.slug}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 flex flex-wrap items-center gap-4">
        <FileText size={20} className="text-[var(--text-muted)]" aria-hidden="true" />
        <div className="flex-1 min-w-[260px]">
          <h3 className="text-sm font-semibold text-[var(--text-strong)]">
            ¿Buscas un dataset específico?
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            La búsqueda full-text vive en <code className="mono text-[var(--text-default)]">/datasets</code> con
            filtros por categoría y formato. O abre la paleta de comandos con{" "}
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
