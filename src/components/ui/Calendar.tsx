"use client";

import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/buttonStyles";

type CalendarProps = DayPickerProps;

export default function Calendar({
  className,
  classNames,
  captionLayout = "label",
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={es}
      captionLayout={captionLayout}
      className={cn("w-fit p-3", className)}
      classNames={{
        root: cn("bg-background", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        caption: "relative flex items-center justify-center pt-1",
        caption_label: cn("text-sm font-semibold capitalize text-text-primary", defaultClassNames.caption_label),
        nav: cn("absolute right-1 top-1 flex items-center gap-1", defaultClassNames.nav),
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), defaultClassNames.button_previous),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), defaultClassNames.button_next),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("grid grid-cols-7 gap-1", defaultClassNames.weekdays),
        weekday:
          cn("flex h-9 items-center justify-center text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted", defaultClassNames.weekday),
        week: cn("mt-1 grid grid-cols-7 gap-1", defaultClassNames.week),
        day: cn("relative h-9 w-9 p-0 text-center", defaultClassNames.day),
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "rounded-lg border border-transparent p-0 text-sm font-medium text-text-primary hover:bg-primary-soft hover:text-accent focus-visible:ring-2 focus-visible:ring-primary-soft aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground",
          defaultClassNames.day_button,
        ),
        today: cn(
          "rounded-lg border border-primary/35 bg-primary-soft/70 font-semibold text-primary",
          defaultClassNames.today,
        ),
        selected: cn(
          "rounded-lg bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
          defaultClassNames.selected,
        ),
        outside: cn("text-text-muted/45 aria-selected:bg-surface-muted aria-selected:text-text-muted/70", defaultClassNames.outside),
        disabled: cn("text-text-muted/50 opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", className)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", className)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
