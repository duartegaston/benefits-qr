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
    <div className={cn("mb-12", isCenter ? "text-center" : "text-left", className)}>
      <span className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 block">
        {eyebrow}
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-gray-600 mt-3 max-w-lg leading-relaxed",
            isCenter ? "mx-auto" : "mr-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
