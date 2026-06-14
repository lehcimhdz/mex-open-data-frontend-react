import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">
        Esta página no existe
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Revisa el URL o regresa al{" "}
        <Link to="/" className="text-brand-700 hover:underline">
          inicio
        </Link>
        .
      </p>
    </div>
  );
}
