import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "violet" | "green" | "red" | "yellow";
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  className?: string;
}

const badgeVariants = cva(
  "inline-flex w-fit items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      color: {
        gray: "bg-surface-muted text-text-muted",
        violet: "bg-accent-soft text-accent-foreground",
        green: "bg-success-soft text-success",
        red: "bg-danger-soft text-danger",
        yellow: "bg-warning-soft text-warning",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  }
);

type BadgeTone = VariantProps<typeof badgeVariants>["color"];

export default function Badge({
  children,
  color = "gray",
  variant,
  className,
}: BadgeProps) {
  const resolvedColor =
    variant === "destructive" ? "red" : variant === "secondary" ? "gray" : color;

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ color: resolvedColor as BadgeTone }), className)}
    >
      {children}
    </span>
  );
}
