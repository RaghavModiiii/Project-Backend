import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils"; 

export function Dialog({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  return <DialogPrimitive.Trigger asChild={asChild}>{children}</DialogPrimitive.Trigger>;
}



export function DialogContent({
  children,
  className,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md z-40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-[90vw] max-w-lg -translate-x-[50%] -translate-y-[50%] rounded-lg bg-white p-6 shadow-lg",
          className
        )}
      >
        {children}

        <DialogPrimitive.Close
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 text-sm">{children}</p>;
}