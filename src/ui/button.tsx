import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "./utils";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1",
  md: "h-9 px-3.5 text-sm gap-1.5",
  lg: "h-11 px-4.5 text-base gap-2",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent-600)] text-[var(--color-ink-0)] hover:bg-[var(--color-accent-700)] disabled:bg-[var(--color-ink-3)] disabled:text-[var(--color-ink-5)]",
  secondary:
    "bg-[var(--surface-2)] text-[var(--text-strong)] hover:bg-[var(--surface-3)] border border-[var(--border-soft)]",
  ghost:
    "bg-transparent text-[var(--text-default)] hover:bg-[var(--surface-2)]",
  link: "h-auto p-0 text-[var(--color-accent-600)] hover:underline underline-offset-4",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      asChild = false,
      className,
      leftIcon,
      rightIcon,
      children,
      ...rest
    },
    ref
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-colors duration-150",
          "disabled:cursor-not-allowed",
          variant !== "link" && SIZES[size],
          VARIANTS[variant],
          className
        )}
        {...rest}
      >
        {leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
        <Slottable>{children}</Slottable>
        {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
      </Comp>
    );
  }
);
