import { useHealth } from "../api/hooks";

export function StatusPill() {
  const { data, isLoading, isError } = useHealth();
  const dotClass = isError
    ? "bg-red-500"
    : isLoading
    ? "bg-[var(--color-ink-3)] dark:bg-[var(--color-night-3)]"
    : "bg-emerald-500";
  const label = isError ? "API caída" : isLoading ? "…" : `API ${data?.status ?? "ok"}`;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mono">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
