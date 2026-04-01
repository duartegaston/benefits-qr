import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-default bg-surface shadow-sm shadow-border-default/80 transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
