import { EstadoReclamo, type EstadoReclamo as ReclamoStatus } from "@/lib/enums";
import type { SemanticVisualVariant } from "@/components/ui/buttonStyles";
import {
  formatDiasValidosSentence,
  getDiaLabel,
  sortDiasValidos,
} from "@/lib/beneficioSchedule";

type StatusVariant = Extract<
  SemanticVisualVariant,
  "muted" | "success" | "danger" | "warning"
>;

type BeneficioStatusPresentation = {
  label: string;
  badgeVariant: StatusVariant;
  dashboardCardToneClassName: string;
  dashboardCardSurfaceClassName: string;
};

type BeneficioAvailabilityPresentation = {
  badgeLabel: string;
  badgeVariant: StatusVariant;
  message: string | null;
  isAvailable: boolean;
};

type ReclamoStatusPresentation = {
  label: string;
  badgeVariant: StatusVariant;
};

export function getBeneficioStatusPresentation(
  isExpired: boolean,
  isAgotado: boolean
): BeneficioStatusPresentation {
  if (isExpired) {
    return {
      label: "Vencido",
      badgeVariant: "danger",
      dashboardCardToneClassName: "border-l-danger-border",
      dashboardCardSurfaceClassName: "",
    };
  }

  if (isAgotado) {
    return {
      label: "Agotado",
      badgeVariant: "warning",
      dashboardCardToneClassName: "border-l-warning-border",
      dashboardCardSurfaceClassName: "",
    };
  }

  return {
    label: "Activo",
    badgeVariant: "success",
    dashboardCardToneClassName: "border-l-success-border",
    dashboardCardSurfaceClassName: "sm:bg-surface/85",
  };
}

export function getBeneficioAvailabilityPresentation({
  isExpired,
  isAgotado,
  isWrongDay,
  todayIndex,
  diasValidos,
}: {
  isExpired: boolean;
  isAgotado: boolean;
  isWrongDay: boolean;
  todayIndex: number;
  diasValidos: number[];
}): BeneficioAvailabilityPresentation {
  if (isExpired) {
    return {
      badgeVariant: "danger",
      badgeLabel: "Vencido",
      message: "Este cupón ya expiró.",
      isAvailable: false,
    };
  }

  if (isAgotado) {
    return {
      badgeVariant: "danger",
      badgeLabel: "Agotado",
      message: "Este cupón alcanzó el límite de usos disponibles.",
      isAvailable: false,
    };
  }

  if (isWrongDay) {
    const diasValidosOrdenados = sortDiasValidos(diasValidos);

    return {
      badgeVariant: "warning",
      badgeLabel: "No disponible hoy",
      message: `Este cupón no está disponible los ${getDiaLabel(todayIndex, "full")}. Aplica los ${formatDiasValidosSentence(
        diasValidosOrdenados,
        {
          emptyLabel: "",
          prefix: "",
          style: "full",
        }
      )}.`,
      isAvailable: false,
    };
  }

  return {
    badgeVariant: "success",
    badgeLabel: "Disponible",
    message: null,
    isAvailable: true,
  };
}

export function getReclamoStatusPresentation(status: ReclamoStatus): ReclamoStatusPresentation {
  if (status === EstadoReclamo.CANCELADO) {
    return { label: "Cancelado", badgeVariant: "muted" };
  }

  if (status === EstadoReclamo.CANJEADO) {
    return { label: "Canjeado", badgeVariant: "success" };
  }

  if (status === EstadoReclamo.VENCIDO) {
    return { label: "Vencido", badgeVariant: "danger" };
  }

  return { label: "Pendiente", badgeVariant: "warning" };
}
