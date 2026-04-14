export const EstadoReclamo = {
  PENDIENTE: "PENDIENTE",
  CANJEADO: "CANJEADO",
  CANCELADO: "CANCELADO",
} as const;

export type EstadoReclamo = (typeof EstadoReclamo)[keyof typeof EstadoReclamo];

export const UserType = {
  LOCAL: "LOCAL",
  CLIENTE: "CLIENTE",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];
