import { EstadoReclamo, type EstadoReclamo as ReclamoStatus } from "@/lib/enums";

export function getReclamoStatusPresentation(status: ReclamoStatus) {
  if (status === EstadoReclamo.CANCELADO) {
    return { label: "Cancelado", color: "gray" as const };
  }

  if (status === EstadoReclamo.CANJEADO) {
    return { label: "Canjeado", color: "green" as const };
  }

  if (status === EstadoReclamo.VENCIDO) {
    return { label: "Vencido", color: "red" as const };
  }

  return { label: "Pendiente", color: "yellow" as const };
}
