import { cn } from "@/lib/utils";

export const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-lg font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

export const buttonVariantClasses = {
  primary:
    "bg-primary text-primary-foreground hover:bg-accent focus-visible:ring-primary",
  muted:
    "bg-surface-muted text-text-muted hover:bg-primary-soft hover:text-accent focus-visible:ring-primary-soft",
  secondary:
    "border border-border-default bg-surface-muted text-text-primary shadow-sm hover:border-border-default hover:bg-surface focus-visible:ring-primary-soft",
  ghost:
    "bg-transparent text-text-muted hover:bg-surface-muted focus-visible:ring-primary-soft",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90 focus-visible:ring-danger",
  logout:
    "border border-danger-border/80 bg-danger-soft/90 text-danger shadow-sm hover:border-danger-border hover:bg-danger-soft hover:text-danger focus-visible:ring-danger",
  success:
    "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success",
  light:
    "border border-primary-soft/70 bg-primary-soft text-accent shadow-sm hover:border-primary hover:bg-primary-soft focus-visible:ring-primary-soft focus-visible:ring-offset-primary",
  subtle:
    "border border-primary-soft/70 bg-surface/80 text-accent shadow-sm hover:border-primary hover:bg-surface hover:text-accent-foreground focus-visible:ring-primary-soft",
} as const;

export const buttonSizeClasses = {
  sm: "min-h-[36px] px-3 py-2 text-sm",
  md: "min-h-[40px] px-4 py-2.5 text-sm",
  lg: "min-h-[48px] px-6 py-3 text-base",
} as const;

export type ButtonVisualVariant = keyof typeof buttonVariantClasses;
export type ButtonVisualSize = keyof typeof buttonSizeClasses;

export function getButtonClasses(
  variant: ButtonVisualVariant,
  size: ButtonVisualSize,
  className?: string
) {
  return cn(
    buttonBaseClasses,
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    className
  );
}
