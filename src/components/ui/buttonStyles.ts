import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-accent focus-visible:ring-primary",
        primary: "bg-primary text-primary-foreground hover:bg-accent focus-visible:ring-primary",
        secondary:
          "border border-border-default bg-surface-muted text-text-primary shadow-sm hover:border-border-default hover:bg-surface focus-visible:ring-primary-soft",
        outline:
          "border border-border-default bg-transparent text-text-primary shadow-sm hover:bg-surface-muted focus-visible:ring-primary-soft",
        ghost: "bg-transparent text-text-muted hover:bg-surface-muted focus-visible:ring-primary-soft",
        destructive: "bg-danger text-danger-foreground hover:bg-danger/90 focus-visible:ring-danger",
        danger: "bg-danger text-danger-foreground hover:bg-danger/90 focus-visible:ring-danger",
        muted:
          "bg-surface-muted text-text-muted hover:bg-primary-soft hover:text-accent focus-visible:ring-primary-soft",
        success: "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success",
        light:
          "border border-primary-soft/70 bg-primary-soft text-accent shadow-sm hover:border-primary hover:bg-primary-soft focus-visible:ring-primary-soft focus-visible:ring-offset-primary",
        subtle:
          "border border-primary-soft/70 bg-surface/80 text-accent shadow-sm hover:border-primary hover:bg-surface hover:text-accent-foreground focus-visible:ring-primary-soft",
        logout:
          "border border-danger-border/80 bg-danger-soft/90 text-danger shadow-sm hover:border-danger-border hover:bg-danger-soft hover:text-danger focus-visible:ring-danger",
        link: "bg-transparent text-primary underline-offset-4 hover:underline focus-visible:ring-primary-soft",
      },
      size: {
        default: "h-10 px-4 py-2.5 text-sm",
        md: "h-10 px-4 py-2.5 text-sm",
        xs: "h-8 px-3 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVisualVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonVisualSize = VariantProps<typeof buttonVariants>["size"];

export function getButtonClasses(
  variant: ButtonVisualVariant,
  size: ButtonVisualSize,
  className?: string
) {
  return buttonVariants({ variant, size, className });
}
