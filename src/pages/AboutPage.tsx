import { PageHeader } from "../components/PageHeader";

export default function AboutPage() {
  return (
    <div className="prose prose-slate max-w-3xl">
      <PageHeader
        title="Acerca de Open Data México · Explorer"
        subtitle="Pieza visual del ecosistema mex-open-data."
      />
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-sm text-slate-700">
        <p>
          Este frontend en React consume el backend{" "}
          <code>mex-open-data-backend-fastapi</code>, que a su vez lee de
          PostgreSQL los datos hidratados por el pipeline Airflow. Toda la
          conexión con <code>datos.gob.mx</code> pasa por la librería{" "}
          <code>open-data-mexico</code> (PyPI 1.2.0).
        </p>
        <h2 className="text-base font-semibold text-slate-900">
          Cómo conectar el frontend con el backend
        </h2>
        <pre className="bg-slate-900 text-slate-100 text-xs p-3 rounded overflow-x-auto">
          <code>{`# 1) Levanta el backend en localhost:18000
docker compose up -d mexdata-backend mexdata-postgres mexdata-redis

# 2) Apunta el frontend al backend
VITE_API_BASE_URL=http://localhost:18000 \\
VITE_API_KEY=optional-key \\
npm run dev`}</code>
        </pre>
        <h2 className="text-base font-semibold text-slate-900">Variables de entorno</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <code>VITE_API_BASE_URL</code> — URL del backend (default: <code>/api</code>,
            con el proxy de Vite hacia <code>localhost:18000</code>).
          </li>
          <li>
            <code>VITE_API_KEY</code> — opcional. Sólo si el backend tiene
            <code> API_KEY_REQUIRED=true</code>.
          </li>
        </ul>
        <h2 className="text-base font-semibold text-slate-900">Páginas disponibles</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><b>Inicio</b> — métricas globales y barras por categoría.</li>
          <li><b>Categorías</b> — grid completo de las 28 categorías temáticas.</li>
          <li><b>Detalle de categoría</b> — datasets dentro de una categoría con histograma.</li>
          <li><b>Detalle de dataset</b> — metadatos, recursos y atajos a EDA/ML.</li>
          <li><b>EDA</b> — perfil por columna, histogramas y matriz de correlación.</li>
          <li><b>ML</b> — K-Means (k=4) + proyección PCA + tabla de centroides.</li>
          <li><b>Búsqueda</b> — full-text con filtros de categoría y formato.</li>
          <li><b>Organizaciones</b> — instituciones publicadoras (cuando el backend las expone).</li>
        </ul>
      </div>
    </div>
  );
}
