import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "./utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title?: string }
>(({ className, title, children, ...rest }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "w-[min(640px,calc(100vw-2rem))] max-h-[85vh] overflow-hidden",
        "bg-[var(--surface-1)] border border-[var(--border-soft)] rounded-lg shadow-xl",
        className
      )}
      {...rest}
    >
      {title ? (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-soft)]">
          <DialogPrimitive.Title className="text-sm font-semibold text-[var(--text-strong)]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Cerrar"
            className="text-[var(--text-muted)] hover:text-[var(--text-strong)] inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
          >
            <X size={16} aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
      ) : null}
      <div>{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;
