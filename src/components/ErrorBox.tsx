import { AlertTriangle } from "lucide-react";
import { ApiError } from "../api/client";

export function ErrorBox({ error }: { error: unknown }) {
  const status = error instanceof ApiError ? error.status : undefined;
  const message = error instanceof Error ? error.message : "Error desconocido";

  const hint =
    status === 401 || status === 403
      ? "El backend requiere una API key. Configura VITE_API_KEY o desactiva auth con API_KEY_REQUIRED=false."
      : status === 404
      ? "El recurso solicitado no existe en el backend."
      : status && status >= 500
      ? "El backend tuvo un problema. Revisa el log del servicio."
      : "Verifica que el backend FastAPI está corriendo en VITE_API_BASE_URL.";

  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 my-6 flex gap-3">
      <AlertTriangle
        className="text-red-600 dark:text-red-400 mt-0.5 shrink-0"
        size={18}
        aria-hidden="true"
      />
      <div>
        <h2 className="text-red-700 dark:text-red-300 font-semibold text-sm">
          No pudimos cargar los datos
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {status ? <span className="mono">{status}</span> : null} {message}
        </p>
        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-2">{hint}</p>
      </div>
    </div>
  );
}
