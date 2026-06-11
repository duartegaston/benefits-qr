"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type LogoFrameProps = {
  src?: string | null;
  alt: string;
  name: string;
  shape?: "square" | "circle";
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function LogoFrame({
  src,
  alt,
  name,
  shape = "square",
  className,
  imageClassName,
  fallbackClassName,
}: LogoFrameProps) {
  const initials = getInitials(name) || "LO";
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-surface-muted/70 text-primary shadow-sm",
        shape === "circle" ? "rounded-full" : "rounded-2xl",
        className,
      )}
    >
      {src && src !== failedSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={cn("h-full w-full rounded-[inherit] object-cover", imageClassName)}
            onError={() => setFailedSrc(src)}
          />
        </>
      ) : (
        <span className={cn("text-sm font-bold", fallbackClassName)}>{initials}</span>
      )}
    </div>
  );
}
