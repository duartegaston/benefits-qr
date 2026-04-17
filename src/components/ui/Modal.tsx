"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Button from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-default bg-surface p-6 shadow-xl outline-none",
            className
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            {title ? (
              <DialogPrimitive.Title className="text-lg font-semibold text-text-primary">
                {title}
              </DialogPrimitive.Title>
            ) : (
              <DialogPrimitive.Title className="sr-only">Modal</DialogPrimitive.Title>
            )}
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" className="ml-auto">
                <X aria-hidden="true" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </DialogPrimitive.Close>
          </div>
          {description ? (
            <DialogPrimitive.Description className="mb-4 text-sm text-text-muted">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
