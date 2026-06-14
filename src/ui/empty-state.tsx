import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--surface-1)] py-10 px-6 text-center">
      {icon ? (
        <div
          aria-hidden="true"
          className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] mb-4"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-[var(--text-strong)]">{title}</h3>
      {description ? (
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
