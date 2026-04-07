type DateValue = Date | string | number;

const dateFormatterAR = new Intl.DateTimeFormat("es-AR");

const dateTimeFormatterAR = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDateAR(value: DateValue) {
  return dateFormatterAR.format(new Date(value));
}

export function formatDateTimeAR(value: DateValue) {
  return dateTimeFormatterAR.format(new Date(value));
}
