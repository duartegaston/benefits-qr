"use client";

import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";

type CalendarProps = DayPickerProps;

export default function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={es}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        caption: "relative flex items-center justify-center px-8 pt-1",
        caption_label: "text-sm font-semibold capitalize text-text-primary",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent p-0 text-text-muted transition-colors",
          "hover:bg-surface-muted hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft",
          "disabled:pointer-events-none disabled:opacity-40",
        ),
        button_next: cn(
          "absolute right-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent p-0 text-text-muted transition-colors",
          "hover:bg-surface-muted hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft",
          "disabled:pointer-events-none disabled:opacity-40",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 gap-1",
        weekday:
          "flex h-9 items-center justify-center text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted",
        week: "mt-1 grid grid-cols-7 gap-1",
        day: "relative h-9 w-9 p-0 text-center",
        day_button: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-transparent p-0 text-sm font-medium text-text-primary transition-colors",
          "hover:bg-primary-soft hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft",
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground",
        ),
        today: "font-semibold text-accent",
        selected: "",
        outside: "text-text-muted/45 aria-selected:bg-surface-muted aria-selected:text-text-muted/70",
        disabled: "text-text-muted/50 opacity-50",
        hidden: "invisible",
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
