import Link from "next/link";
import { ButtonVisualSize, ButtonVisualVariant, getButtonClasses } from "@/components/ui/buttonStyles";
import { ComponentPropsWithoutRef } from "react";

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVisualVariant;
  size?: ButtonVisualSize;
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
