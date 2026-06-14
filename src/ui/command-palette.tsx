import { Command } from "cmdk";
import { ArrowRight, Folders, LayoutDashboard, Search, Building2, Sparkles, FileText, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../api/hooks";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: categories } = useCategories();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if (((isMac && e.metaKey) || (!isMac && e.ctrlKey)) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir paleta de comandos"
        className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--text-muted)] text-sm hover:bg-[var(--surface-3)] hover:text-[var(--text-default)]"
      >
        <Search size={14} aria-hidden="true" />
        <span className="hidden md:inline">Buscar</span>
        <span className="ml-2 hidden sm:inline-flex h-5 items-center rounded border border-[var(--border-soft)] px-1.5 text-[10px] mono">
          ⌘K
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <Command
            label="Paleta de comandos"
            className="w-full max-w-xl rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 border-b border-[var(--border-soft)]">
              <Search size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
              <Command.Input
                placeholder="Buscar categorías, datasets, páginas…"
                value={query}
                onValueChange={setQuery}
                className="flex-1 h-12 bg-transparent text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[var(--border-soft)] px-1.5 text-[10px] mono text-[var(--text-muted)]">
                Esc
              </kbd>
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-6 text-sm text-[var(--text-muted)] text-center">
                Sin coincidencias.
              </Command.Empty>

              <Command.Group heading="Ir a">
                <PaletteItem
                  onSelect={() => go("/")}
                  icon={<LayoutDashboard size={14} />}
                  label="Inicio"
                  shortcut="g h"
                />
                <PaletteItem
                  onSelect={() => go("/categorias")}
                  icon={<Folders size={14} />}
                  label="Categorías"
                  shortcut="g c"
                />
                <PaletteItem
                  onSelect={() => go("/datasets")}
                  icon={<FileText size={14} />}
                  label="Datasets"
                  shortcut="g d"
                />
                <PaletteItem
                  onSelect={() => go("/organizaciones")}
                  icon={<Building2 size={14} />}
                  label="Organizaciones"
                />
                <PaletteItem
                  onSelect={() => go("/acerca")}
                  icon={<Info size={14} />}
                  label="Acerca"
                />
              </Command.Group>

              {categories && categories.length ? (
                <Command.Group heading="Categorías">
                  {categories.slice(0, 30).map((c) => (
                    <PaletteItem
                      key={c.slug}
                      onSelect={() => go(`/categorias/${c.slug}`)}
                      icon={<Sparkles size={14} />}
                      label={c.name}
                      hint={c.slug}
                    />
                  ))}
                </Command.Group>
              ) : null}
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}

function PaletteItem({
  onSelect,
  icon,
  label,
  hint,
  shortcut,
}: {
  onSelect: () => void;
  icon: React.ReactNode;
  label: React.ReactNode;
  hint?: string;
  shortcut?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-default)] cursor-pointer data-[selected=true]:bg-[var(--surface-2)] data-[selected=true]:text-[var(--text-strong)]"
    >
      <span className="text-[var(--text-muted)] group-data-[selected=true]:text-[var(--color-accent-600)]">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint ? (
        <span className="text-[11px] mono text-[var(--text-muted)] truncate">{hint}</span>
      ) : null}
      {shortcut ? (
        <kbd className="ml-2 inline-flex h-5 items-center rounded border border-[var(--border-soft)] px-1.5 text-[10px] mono text-[var(--text-muted)]">
          {shortcut}
        </kbd>
      ) : null}
      <ArrowRight size={12} className="text-[var(--text-muted)]" aria-hidden="true" />
    </Command.Item>
  );
}
