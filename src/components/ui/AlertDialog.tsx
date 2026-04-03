"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn("fixed inset-0 z-50 bg-text-primary/50 backdrop-blur-sm", className)}
    {...props}
  />
));

AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-default bg-surface p-6 shadow-xl outline-none",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <AlertDialogPrimitive.Cancel asChild>
          <Button variant="ghost" size="icon-sm" className="absolute right-4 top-4">
            <X aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </AlertDialogPrimitive.Cancel>
      ) : null}
    </AlertDialogPrimitive.Content>
  </AlertDialogPortal>
));

AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

function AlertDialogHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-lg font-semibold text-text-primary", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-sm text-text-muted", className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
