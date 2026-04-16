import Image from "next/image";
import { cn } from "@/lib/utils";

type IPhoneMockupProps = {
  imageSrc: string;
  imageAlt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  frameClassName?: string;
  screenClassName?: string;
  imageClassName?: string;
};

export default function IPhoneMockup({
  imageSrc,
  imageAlt,
  sizes,
  priority = false,
  className,
  frameClassName,
  screenClassName,
  imageClassName,
}: IPhoneMockupProps) {
  return (
    <div className={cn("relative mx-auto w-full", className)}>
      <div
        className={cn(
          "relative mx-auto w-full rounded-[3rem] border border-slate-800/90 bg-linear-to-b from-slate-800 via-slate-950 to-black p-[7px] shadow-[0_28px_70px_-32px_rgba(18,34,59,0.42)] ring-1 ring-white/12",
          frameClassName,
        )}
      >
        <div className="pointer-events-none absolute top-[4.7rem] -left-[2px] hidden h-14 w-[3px] rounded-r-full bg-slate-700/80 lg:block" />
        <div className="pointer-events-none absolute top-[7.8rem] -left-[2px] hidden h-20 w-[3px] rounded-r-full bg-slate-700/75 lg:block" />
        <div className="pointer-events-none absolute top-[7rem] -right-[2px] hidden h-24 w-[3px] rounded-l-full bg-slate-700/80 lg:block" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2.5">
          <div className="flex h-6 w-[7.5rem] items-center justify-center rounded-full bg-black/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-800 ring-1 ring-white/10" />
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-[2.55rem] border border-white/10 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
            screenClassName,
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1290}
            height={2796}
            priority={priority}
            sizes={sizes}
            className={cn("h-auto w-full", imageClassName)}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <div className="h-1.5 w-[34%] rounded-full bg-white/18" />
        </div>
      </div>
    </div>
  );
}
