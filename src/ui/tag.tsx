import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./utils";

type Variant = "neutral" | "accent" | "good" | "warn" | "bad" | "info" | "mono";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
  size?: "sm" | "md";
  leftIcon?: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  neutral:
    "bg-[var(--surface-2)] text-[var(--text-default)] border-[var(--border-soft)]",
  accent:
    "bg-[var(--color-accent-50)] text-[var(--color-accent-700)] border-[var(--color-accent-100)]",
  good: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  warn: "bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  bad: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  info: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  mono: "bg-transparent text-[var(--text-muted)] border-[var(--border-soft)] font-mono mono",
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = "neutral", size = "sm", className, leftIcon, children, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
      {children}
    </span>
  );
});
