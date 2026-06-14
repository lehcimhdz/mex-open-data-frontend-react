import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./ui/shell";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import DatasetDetailPage from "./pages/DatasetDetailPage";
import DatasetsPage from "./pages/DatasetsPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* English aliases redirect to Spanish */}
        <Route path="/categories" element={<Navigate to="/categorias" replace />} />
        <Route path="/categories/:slug" element={<RedirectCategory />} />
        <Route path="/search" element={<Navigate to="/datasets" replace />} />
        <Route path="/organizations" element={<Navigate to="/organizaciones" replace />} />
        <Route path="/about" element={<Navigate to="/acerca" replace />} />

        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/categorias/:slug" element={<CategoryDetailPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
        <Route path="/datasets/:slug" element={<DatasetDetailPage />} />
        <Route path="/datasets/:slug/eda" element={<DatasetDetailPage initialTab="eda" />} />
        <Route path="/datasets/:slug/ml" element={<DatasetDetailPage initialTab="ml" />} />
        <Route path="/organizaciones" element={<OrganizationsPage />} />
        <Route path="/acerca" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Shell>
  );
}

function RedirectCategory() {
  const slug = window.location.pathname.split("/").pop();
  return <Navigate to={`/categorias/${slug ?? ""}`} replace />;
}
