import { Link } from "react-router-dom";
import { PageShell } from "../ui/page";

export default function NotFoundPage() {
  return (
    <PageShell width="prose">
      <div className="text-center py-16">
        <p className="text-7xl serif font-semibold text-[var(--color-accent-600)] leading-none">
          404
        </p>
        <h1 className="mt-6 text-xl font-semibold text-[var(--text-strong)] serif">
          Esta página no existe
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          El URL no corresponde a una ruta del catálogo.{" "}
          <Link to="/" className="hover:text-[var(--text-strong)]">
            Volver al inicio
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
