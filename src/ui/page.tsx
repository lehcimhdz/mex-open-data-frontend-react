import type { ReactNode } from "react";
import { cn } from "./utils";

type Width = "prose" | "narrow" | "default" | "wide";

const WIDTHS: Record<Width, string> = {
  prose: "max-w-[72ch]",
  narrow: "max-w-[960px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1440px]",
};

export function PageShell({
  width = "default",
  children,
}: {
  width?: Width;
  children: ReactNode;
}) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", WIDTHS[width])}>{children}</div>;
}

export function PageHero({
  kicker,
  title,
  subtitle,
  actions,
  meta,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--border-soft)] py-8 mb-8">
      {kicker ? (
        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)] mb-2 font-medium mono">
          {kicker}
        </div>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="serif text-3xl sm:text-4xl font-semibold text-[var(--text-strong)] leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base text-[var(--text-default)] mt-3">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2 items-center">{actions}</div> : null}
      </div>
      {meta ? <div className="mt-4 text-xs text-[var(--text-muted)]">{meta}</div> : null}
    </header>
  );
}
