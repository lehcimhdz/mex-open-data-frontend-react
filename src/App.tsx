import { NavLink, Route, Routes, Link } from "react-router-dom";
import { useHealth } from "./api/hooks";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import DatasetDetailPage from "./pages/DatasetDetailPage";
import DatasetEdaPage from "./pages/DatasetEdaPage";
import DatasetMlPage from "./pages/DatasetMlPage";
import SearchPage from "./pages/SearchPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-600 text-white"
            : "text-slate-700 hover:bg-slate-200"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function StatusPill() {
  const { data, isLoading, isError } = useHealth();
  const colour = isError
    ? "bg-red-100 text-red-700"
    : isLoading
    ? "bg-slate-100 text-slate-500"
    : "bg-emerald-100 text-emerald-700";
  const text = isError ? "API caída" : isLoading ? "..." : `API ${data?.status ?? "ok"}`;
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${colour}`}>
      {text}
    </span>
  );
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-md bg-brand-600 text-white inline-grid place-items-center font-bold"
              aria-hidden="true"
            >
              MX
            </span>
            <span className="font-semibold text-slate-900 hidden sm:block">
              Open Data México
            </span>
          </Link>
          <nav className="ml-2 flex flex-wrap gap-1 flex-1">
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/categories">Categorías</NavItem>
            <NavItem to="/search">Búsqueda</NavItem>
            <NavItem to="/organizations">Organizaciones</NavItem>
            <NavItem to="/about">Acerca</NavItem>
          </nav>
          <StatusPill />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/datasets/:slug" element={<DatasetDetailPage />} />
          <Route path="/datasets/:slug/eda" element={<DatasetEdaPage />} />
          <Route path="/datasets/:slug/ml" element={<DatasetMlPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-slate-500 flex flex-wrap gap-2 justify-between">
          <span>
            Datos: <a className="underline" href="https://datos.gob.mx">datos.gob.mx</a>
          </span>
          <span>
            Front:{" "}
            <a className="underline" href="https://github.com/lehcimhdz/mex-open-data-frontend-react">
              mex-open-data-frontend-react
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
