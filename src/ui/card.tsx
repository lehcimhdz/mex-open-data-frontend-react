import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

export function Card({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-lg",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-b border-[var(--border-soft)] flex items-baseline gap-3 justify-between">
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-strong)] tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
