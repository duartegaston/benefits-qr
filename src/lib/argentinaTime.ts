import { TIMEZONE_AR } from "@/lib/constants";

const arDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_AR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const arWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_AR,
  weekday: "short",
});

const WEEKDAY_INDEX_BY_LABEL = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
} as const;

function getArgentinaDateParts(referenceDate: Date) {
  const parts = arDatePartsFormatter.formatToParts(referenceDate);

  return parts.reduce(
    (acc, part) => {
      if (part.type === "year" || part.type === "month" || part.type === "day") {
        acc[part.type] = part.value;
      }

      return acc;
    },
    { year: "", month: "", day: "" }
  );
}

export function getCurrentISODateInArgentina(referenceDate = new Date()) {
  const { year, month, day } = getArgentinaDateParts(referenceDate);
  return `${year}-${month}-${day}`;
}

export function getCurrentDayInArgentina(referenceDate = new Date()) {
  const weekdayLabel = arWeekdayFormatter.format(referenceDate) as keyof typeof WEEKDAY_INDEX_BY_LABEL;
  return WEEKDAY_INDEX_BY_LABEL[weekdayLabel];
}
