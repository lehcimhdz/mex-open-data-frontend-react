import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: "sm" | "md";
  variant?: "ghost" | "subtle";
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, size = "md", variant = "ghost", className, children, ...rest },
    ref
  ) {
    const button = (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors duration-150",
          size === "sm" ? "h-7 w-7" : "h-9 w-9",
          variant === "ghost"
            ? "bg-transparent text-[var(--text-default)] hover:bg-[var(--surface-2)]"
            : "bg-[var(--surface-2)] text-[var(--text-strong)] hover:bg-[var(--surface-3)]",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );

    return (
      <TooltipPrimitive.Provider delayDuration={400}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side="bottom"
              sideOffset={6}
              className="z-50 rounded-md bg-[var(--color-ink-9)] text-[var(--color-ink-0)] px-2 py-1 text-xs shadow-md"
            >
              {label}
              <TooltipPrimitive.Arrow className="fill-[var(--color-ink-9)]" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  }
);
