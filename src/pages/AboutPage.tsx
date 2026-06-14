import { Link } from "react-router-dom";
import { PageHero, PageShell } from "../ui/page";
import { Card, CardBody } from "../ui/card";

export default function AboutPage() {
  return (
    <PageShell width="prose">
      <PageHero
        kicker="acerca"
        title="MX Open · Datos abiertos del gobierno de México"
        subtitle="Pieza visual del ecosistema mex-open-data. Convierte el catálogo de datos.gob.mx en tableros, EDA y modelos sin pedir trámite a nadie."
      />
      <div className="serif text-[var(--text-default)] text-base leading-relaxed space-y-5">
        <p>
          La identidad visual usa <strong>neutros stone</strong> y un acento{" "}
          <span className="text-[var(--color-accent-600)]">cinabrio</span> — el
          pigmento sagrado mesoamericano que el diseño mexicano moderno
          (Barragán, Casa Estudio, museos contemporáneos) volvió a poner en
          circulación. Salimos del verde de la bandera porque la voz que
          queremos no es la de una intranet.
        </p>
        <p>
          La cadena de datos arranca en la librería{" "}
          <a className="link-accent" href="https://pypi.org/project/open-data-mexico/" target="_blank" rel="noreferrer">
            <code className="mono">open-data-mexico</code>
          </a>{" "}
          (PyPI), pasa por el pipeline Airflow (
          <a className="link-accent" href="https://github.com/lehcimhdz/mex-open-data-pipeline" target="_blank" rel="noreferrer">
            <code className="mono">mex-open-data-pipeline</code>
          </a>
          ), aterriza en S3 + Postgres y se sirve por la API FastAPI (
          <a className="link-accent" href="https://github.com/lehcimhdz/mex-open-data-backend-fastapi" target="_blank" rel="noreferrer">
            <code className="mono">mex-open-data-backend-fastapi</code>
          </a>
          ). Este frontend es la última capa.
        </p>
      </div>

      <Card className="mt-8">
        <CardBody>
          <h2 className="text-sm font-semibold text-[var(--text-strong)] mb-3">
            Cómo conectarlo
          </h2>
          <pre className="bg-[var(--color-ink-9)] text-[var(--color-ink-0)] dark:bg-[var(--color-night-9)] dark:text-[var(--color-night-0)] mono text-xs p-3 rounded overflow-x-auto leading-relaxed">
            <code>{`docker compose up -d mexdata-backend mexdata-postgres mexdata-redis

VITE_API_BASE_URL=http://localhost:18000 \\
VITE_API_KEY=optional-key \\
npm run dev`}</code>
          </pre>
          <ul className="text-sm text-[var(--text-default)] mt-4 list-disc list-inside space-y-1">
            <li>
              <code className="mono">VITE_API_BASE_URL</code> — default{" "}
              <code className="mono">/api</code>, con el proxy de Vite hacia{" "}
              <code className="mono">localhost:18000</code>.
            </li>
            <li>
              <code className="mono">VITE_API_KEY</code> — sólo si el backend
              tiene <code className="mono">API_KEY_REQUIRED=true</code>.
            </li>
          </ul>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <h2 className="text-sm font-semibold text-[var(--text-strong)] mb-3">
            Atajos de teclado
          </h2>
          <ul className="text-sm text-[var(--text-default)] grid grid-cols-2 gap-y-1.5 gap-x-6">
            <li><kbd className="mono">⌘K</kbd> — paleta de comandos</li>
            <li><kbd className="mono">g h</kbd> — Inicio</li>
            <li><kbd className="mono">g c</kbd> — Categorías</li>
            <li><kbd className="mono">g d</kbd> — Datasets</li>
            <li><kbd className="mono">g o</kbd> — Organizaciones</li>
            <li><kbd className="mono">g a</kbd> — Acerca</li>
          </ul>
        </CardBody>
      </Card>

      <p className="text-xs text-[var(--text-muted)] mt-6">
        ¿Bug o sugerencia?{" "}
        <Link to="/" className="hover:text-[var(--text-strong)]">
          Vuelve al inicio
        </Link>{" "}
        o abre un issue en el repo.
      </p>
    </PageShell>
  );
}
