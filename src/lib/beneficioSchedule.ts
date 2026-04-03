export const BENEFICIO_WEEKDAYS = [
  { value: 0, shortLabel: "Dom", fullLabel: "domingo" },
  { value: 1, shortLabel: "Lun", fullLabel: "lunes" },
  { value: 2, shortLabel: "Mar", fullLabel: "martes" },
  { value: 3, shortLabel: "Mié", fullLabel: "miércoles" },
  { value: 4, shortLabel: "Jue", fullLabel: "jueves" },
  { value: 5, shortLabel: "Vie", fullLabel: "viernes" },
  { value: 6, shortLabel: "Sáb", fullLabel: "sábado" },
] as const;

type LabelStyle = "short" | "full";

interface FormatDiasOptions {
  emptyLabel?: string;
  prefix?: string;
  style?: LabelStyle;
}

export function sortDiasValidos(dias: number[]) {
  return [...dias].sort((left, right) => left - right);
}

export function getDiaLabel(value: number, style: LabelStyle = "short") {
  const day = BENEFICIO_WEEKDAYS.find((item) => item.value === value);
  return day ? day[style === "full" ? "fullLabel" : "shortLabel"] : String(value);
}

export function formatDiasValidosList(
  dias: number[],
  style: LabelStyle = "short",
  separator = ", ",
) {
  return sortDiasValidos(dias)
    .map((day) => getDiaLabel(day, style))
    .join(separator);
}

export function formatDiasValidosSentence(
  dias: number[],
  {
    emptyLabel = "Válido todos los días",
    prefix = "Válido los",
    style = "short",
  }: FormatDiasOptions = {},
) {
  const sorted = sortDiasValidos(dias);

  if (sorted.length === 0) {
    return emptyLabel;
  }

  if (sorted.length === 1) {
    return `${prefix} ${getDiaLabel(sorted[0], style)}`;
  }

  const names = sorted.map((day) => getDiaLabel(day, style));
  const last = names.pop();

  return `${prefix} ${names.join(", ")} y ${last}`;
}
