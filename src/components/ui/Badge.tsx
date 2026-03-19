import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "violet" | "green" | "red" | "yellow";
  className?: string;
}

const colors = {
  gray: "bg-gray-100 text-gray-700",
  violet: "bg-violet-100 text-violet-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
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
