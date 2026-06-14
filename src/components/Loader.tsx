export function Loader({ label = "Cargando..." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 text-slate-500 py-10 justify-center"
    >
      <span
        className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
