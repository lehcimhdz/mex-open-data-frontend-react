import type { ReactNode } from "react";
import { cn } from "./utils";

export function KPI({
  label,
  value,
  helper,
  delta,
  chart,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  delta?: { label: ReactNode; sign?: "up" | "down" | "flat" };
  chart?: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-[var(--surface-1)] p-4 flex flex-col gap-3",
        tone === "accent"
          ? "border-[var(--color-accent-100)] bg-[var(--color-accent-50)]"
          : "border-[var(--border-soft)]"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10.5px] uppercase tracking-[0.12em] font-medium text-[var(--text-muted)]">
          {label}
        </span>
        {delta ? (
          <span
            className={cn(
              "text-[10.5px] font-medium uppercase tracking-wide",
              delta.sign === "up" && "text-emerald-600",
              delta.sign === "down" && "text-red-600",
              (!delta.sign || delta.sign === "flat") && "text-[var(--text-muted)]"
            )}
          >
            {delta.label}
          </span>
        ) : null}
      </div>
      <div className="flex items-end gap-2 justify-between">
        <div>
          <div className="text-2xl font-semibold text-[var(--text-strong)] numeric leading-none">
            {value}
          </div>
          {helper ? (
            <div className="text-xs text-[var(--text-muted)] mt-1">{helper}</div>
          ) : null}
        </div>
        {chart ? <div className="shrink-0 h-8 w-20">{chart}</div> : null}
      </div>
    </div>
  );
}
