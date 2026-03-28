import Link from "next/link";
import { getButtonClasses } from "@/components/ui/buttonStyles";
import { ComponentPropsWithoutRef } from "react";

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "light" | "subtle";
  size?: "sm" | "md" | "lg";
};

export default function LinkButton({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={getButtonClasses(variant, size, className)}
      {...props}
    >
      {children}
    </Link>
  );
}
