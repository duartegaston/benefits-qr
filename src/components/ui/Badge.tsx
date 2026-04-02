import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "violet" | "green" | "red" | "yellow";
  className?: string;
}

const colors = {
  gray: "bg-surface-muted text-text-muted",
  violet: "bg-accent-soft text-accent-foreground",
  green: "bg-success-soft text-success",
  red: "bg-danger-soft text-danger",
  yellow: "bg-warning-soft text-warning",
};

export default function Badge({
  children,
  color = "gray",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
