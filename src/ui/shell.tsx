import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Wordmark } from "./wordmark";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { StatusPill } from "./status-pill";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `relative h-9 px-3 inline-flex items-center text-sm transition-colors ${
          isActive
            ? "text-[var(--text-strong)]"
            : "text-[var(--text-default)] hover:text-[var(--text-strong)]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive ? (
            <span
              aria-hidden="true"
              className="absolute inset-x-3 -bottom-px h-px bg-[var(--color-accent-600)]"
            />
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function useGlobalShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    let g = false;
    let timer: number | null = null;
    const onKey = (e: KeyboardEvent) => {
      // Ignore inside inputs/textareas/contenteditables
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      )
        return;
      if (e.key === "g") {
        g = true;
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => (g = false), 750);
        return;
      }
      if (!g) return;
      if (e.key === "h") {
        e.preventDefault();
        g = false;
        navigate("/");
      } else if (e.key === "c") {
        e.preventDefault();
        g = false;
        navigate("/categorias");
      } else if (e.key === "d") {
        e.preventDefault();
        g = false;
        navigate("/datasets");
      } else if (e.key === "o") {
        e.preventDefault();
        g = false;
        navigate("/organizaciones");
      } else if (e.key === "a") {
        e.preventDefault();
        g = false;
        navigate("/acerca");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) window.clearTimeout(timer);
    };
  }, [navigate]);
}

export function Shell({ children }: { children: React.ReactNode }) {
  useGlobalShortcuts();

  return (
    <div className="min-h-full flex flex-col bg-[var(--surface-0)]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--surface-1)] focus:px-3 focus:py-1.5 focus:text-sm focus:text-[var(--text-strong)] focus:border focus:border-[var(--border-soft)]"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-[var(--border-soft)] bg-[var(--surface-0)] sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link to="/" className="shrink-0">
            <Wordmark />
          </Link>
          <nav
            aria-label="Principal"
            className="hidden md:flex items-center gap-0.5 ml-2"
          >
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/categorias">Categorías</NavItem>
            <NavItem to="/datasets">Datasets</NavItem>
            <NavItem to="/organizaciones">Organizaciones</NavItem>
            <NavItem to="/acerca">Acerca</NavItem>
          </nav>
          <div className="flex-1" />
          <CommandPalette />
          <ThemeToggle />
          <div className="hidden lg:block">
            <StatusPill />
          </div>
        </div>
      </header>

      <main id="contenido" className="flex-1 w-full py-10">
        {children}
      </main>

      <footer className="border-t border-[var(--border-soft)] bg-[var(--surface-1)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-3 justify-between text-[11px] mono text-[var(--text-muted)]">
          <span>
            Fuente · {" "}
            <a className="underline" href="https://www.datos.gob.mx/" target="_blank" rel="noreferrer">
              datos.gob.mx
            </a>
          </span>
          <span>
            Librería ·{" "}
            <a className="underline" href="https://pypi.org/project/open-data-mexico/" target="_blank" rel="noreferrer">
              open-data-mexico
            </a>
          </span>
          <span>
            Repo ·{" "}
            <a className="underline" href="https://github.com/lehcimhdz/mex-open-data-frontend-react" target="_blank" rel="noreferrer">
              mex-open-data-frontend-react
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
