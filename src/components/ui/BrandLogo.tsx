import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "page" | "header";

const logoSizeByVariant: Record<BrandLogoVariant, string> = {
  page: "w-24 lg:w-22 2xl:w-24",
  header: "w-20 lg:w-[4.5rem] 2xl:w-20",
};

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  variant = "page",
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <div className={cn(logoSizeByVariant[variant], className)}>
      <Image
        src="/logo.png"
        alt="Qupón"
        width={500}
        height={450}
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  );
}
