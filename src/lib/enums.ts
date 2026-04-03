export const EstadoReclamo = {
  PENDIENTE: "PENDIENTE",
  CANJEADO: "CANJEADO",
  VENCIDO: "VENCIDO",
  CANCELADO: "CANCELADO",
} as const;

export type EstadoReclamo = (typeof EstadoReclamo)[keyof typeof EstadoReclamo];
