import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { SemanticVisualVariant } from "@/components/ui/buttonStyles";

interface BadgeProps {
  children: React.ReactNode;
  variant?: SemanticVisualVariant;
  className?: string;
}

const badgeVariants = cva(
  "inline-flex w-fit items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        warning: "bg-warning-soft text-warning",
        primary: "bg-primary-soft text-accent",
        secondary: "bg-surface-muted text-text-primary",
        success: "bg-success-soft text-success",
        danger: "bg-danger-soft text-danger",
        light: "border border-primary-soft/70 bg-primary-soft text-accent",
        muted: "bg-surface-muted text-text-muted",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export default function Badge({
  children,
  variant = "secondary",
  className,
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
    >
      {children}
    </span>
  );
}
