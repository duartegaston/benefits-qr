import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "mb-10 lg:mb-8 2xl:mb-12",
        isCenter ? "text-center" : "text-left",
        className
      )}
    >
      <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-primary lg:mb-2.5 2xl:mb-3">
        {eyebrow}
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-text-primary lg:text-xl 2xl:text-2xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-3 max-w-full leading-relaxed text-text-muted lg:mt-2.5 lg:text-sm 2xl:mt-3 2xl:text-base",
            isCenter ? "mx-auto" : "mr-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
