import { useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Tags as TagsIcon } from "lucide-react";
import { useDataset } from "../api/hooks";
import { PageHero, PageShell } from "../ui/page";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Loader } from "../components/Loader";
import { ErrorBox } from "../components/ErrorBox";
import { Tag } from "../ui/tag";
import { Card, CardBody, CardHeader } from "../ui/card";
import { KPI } from "../ui/kpi";
import { formatBytes, formatDate, formatNumber } from "../lib/format";
import type { DatasetDetail, Resource } from "../api/types";
import { EmptyState } from "../ui/empty-state";
import { Button } from "../ui/button";
import { DatasetEdaServerSide } from "./_dataset/EdaServerSide";
import { DatasetMl } from "./_dataset/Ml";

type Tab = "resumen" | "recursos" | "eda" | "ml";
const ALL_TABS: Tab[] = ["resumen", "recursos", "eda", "ml"];

export default function DatasetDetailPage({
  initialTab,
}: {
  initialTab?: Tab;
} = {}) {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useDataset(slug);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = (params.get("tab") as Tab) ?? initialTab ?? "resumen";
  const setTab = (t: string) => {
    const next = new URLSearchParams(params);
    if (t === "resumen") next.delete("tab");
    else next.set("tab", t);
    setParams(next, { replace: true });
  };

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
  if (!data) return null;

  const firstCsv = data.resources.find(
    (r) => (r.format || "").toLowerCase() === "csv" && r.download_url
  );

  return (
    <PageShell width="wide">
      <PageHero
        kicker={`dataset · ${data.category_slug ?? "—"}`}
        title={data.title}
        subtitle={data.description ?? undefined}
        actions={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft size={14} />}
            >
              Volver
            </Button>
            {firstCsv?.download_url ? (
              <Button asChild>
                <a href={firstCsv.download_url} target="_blank" rel="noreferrer">
                  Descargar CSV
                </a>
              </Button>
            ) : null}
          </>
        }
        meta={
          <span className="mono">
            slug · {data.slug} · última actualización ·{" "}
            {formatDate(data.last_updated)}
          </span>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          {ALL_TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {LABELS[t]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumen">
          <SummaryTab data={data} />
        </TabsContent>
        <TabsContent value="recursos">
          <ResourcesTab data={data} />
        </TabsContent>
        <TabsContent value="eda">
          <DatasetEdaServerSide data={data} />
        </TabsContent>
        <TabsContent value="ml">
          <DatasetMl data={data} />
        </TabsContent>
      </Tabs>

      <div className="text-xs text-[var(--text-muted)] mt-8 mono">
        <Link to="/datasets" className="hover:text-[var(--text-strong)]">
          ← Todos los datasets
        </Link>
      </div>
    </PageShell>
  );
}

const LABELS: Record<Tab, string> = {
  resumen: "Resumen",
  recursos: "Recursos",
  eda: "EDA",
  ml: "ML",
};

function SummaryTab({ data }: { data: DatasetDetail }) {
  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI
          label="Categoría"
          value={
            data.category_slug ? (
              <Link
                to={`/categorias/${data.category_slug}`}
                className="text-[var(--text-strong)] text-base"
              >
                {data.category_name ?? data.category_slug}
              </Link>
            ) : (
              <span className="text-base">—</span>
            )
          }
        />
        <KPI
          label="Organización"
          value={
            <span className="text-base">
              {data.organization ?? data.organization_name ?? "—"}
            </span>
          }
        />
        <KPI label="Recursos" value={formatNumber(data.resources.length)} />
        <KPI
          label="Licencia"
          value={<span className="text-base">{data.license_name ?? "—"}</span>}
        />
      </section>

      {data.tags && data.tags.length ? (
        <Card className="mb-6">
          <CardHeader title="Etiquetas" subtitle="Click para filtrar en /datasets" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <Link
                  key={t}
                  to={`/datasets?q=${encodeURIComponent(t)}`}
                  className="no-underline"
                >
                  <Tag
                    variant="neutral"
                    leftIcon={<TagsIcon size={12} aria-hidden="true" />}
                  >
                    {t}
                  </Tag>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {data.description ? (
        <Card>
          <CardHeader title="Descripción" />
          <CardBody className="prose prose-sm dark:prose-invert max-w-[72ch] serif text-[var(--text-default)]">
            <p>{data.description}</p>
          </CardBody>
        </Card>
      ) : null}
    </>
  );
}

function ResourcesTab({ data }: { data: DatasetDetail }) {
  const groups = useMemo(() => {
    const out: Record<string, Resource[]> = {};
    for (const r of data.resources) {
      const f = (r.format || "otros").toLowerCase();
      out[f] = out[f] ?? [];
      out[f].push(r);
    }
    return out;
  }, [data.resources]);

  if (!data.resources.length) {
    return (
      <EmptyState
        title="Sin recursos"
        description="Este dataset no tiene archivos asociados todavía."
      />
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)]">
      <ul className="divide-y divide-[var(--border-soft)]">
        {data.resources.map((r) => (
          <li
            key={r.resource_id}
            className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-2)] transition-colors"
          >
            <Tag
              variant={(r.format || "").toLowerCase() === "csv" ? "accent" : "mono"}
              size="sm"
            >
              {(r.format || "?").toUpperCase()}
            </Tag>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[var(--text-strong)] truncate">
                {r.name ?? r.resource_id}
              </div>
              <div className="text-[11px] mono text-[var(--text-muted)] truncate">
                {r.resource_id}
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)] mono shrink-0">
              {formatBytes(r.file_size)}
            </div>
            {r.download_url ? (
              <a
                href={r.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 px-2.5 items-center gap-1 rounded-md border border-[var(--border-soft)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--text-strong)]"
                aria-label={`Descargar ${r.name ?? r.resource_id}`}
              >
                Descargar <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="px-4 py-2 border-t border-[var(--border-soft)] text-[11px] mono text-[var(--text-muted)]">
        {Object.entries(groups)
          .map(([fmt, list]) => `${fmt}: ${list.length}`)
          .join("  ·  ")}
      </div>
    </div>
  );
}
