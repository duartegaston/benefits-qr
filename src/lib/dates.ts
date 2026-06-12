type DateValue = Date | string | number;

const RAW_DB_TIMESTAMP_WITHOUT_TIMEZONE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

const dateFormatterAR = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
});

const dateTimeFormatterAR = new Intl.DateTimeFormat("es-AR", {
  year: "2-digit",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatDateAR(value: DateValue) {
  return dateFormatterAR.format(new Date(value));
}

export function formatDateTimeAR(value: DateValue) {
  return dateTimeFormatterAR.format(new Date(value));
}

export function parseRawDbTimestamp(value: Date | string) {
  if (value instanceof Date) {
    return value;
  }

  const normalized = RAW_DB_TIMESTAMP_WITHOUT_TIMEZONE.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;

  return new Date(normalized);
}
