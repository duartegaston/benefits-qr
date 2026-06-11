"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getContainedLogoPaddingClass } from "@/lib/logoPresentation";

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
  const [paddingClass, setPaddingClass] = useState("p-1");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-surface-muted/70 text-primary shadow-sm",
        shape === "circle" ? "rounded-full" : "rounded-2xl",
        className,
      )}
    >
      {src ? (
        <span className={cn("h-full w-full overflow-hidden rounded-[inherit] transition-[padding] duration-150", paddingClass)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onLoad={(event) => {
              setPaddingClass(
                getContainedLogoPaddingClass(
                  event.currentTarget.naturalWidth,
                  event.currentTarget.naturalHeight,
                ),
              );
            }}
            className={cn("h-full w-full rounded-[inherit] object-contain", imageClassName)}
          />
        </span>
      ) : (
        <span className={cn("text-sm font-bold", fallbackClassName)}>{initials}</span>
      )}
    </div>
  );
}
