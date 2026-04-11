type DateValue = Date | string | number;

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
