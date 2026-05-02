import { evaluateBeneficioState, type BeneficioEffectiveStatus } from "@/lib/couponStatus";
import { getBeneficioAvailabilityPresentation } from "@/lib/statusPresentation";
import { getPublicBenefitsCatalogRaw } from "@/server/repositories/publicBenefitsRepository";

export type PublicBenefitCardData = {
  id: string;
  descripcion: string;
  fechaExpiracion: Date;
  maxUsos: number | null;
  diasValidos: number[];
  requiereDatos: boolean;
  createdAt: Date;
  canjeados: number;
  effectiveStatus: BeneficioEffectiveStatus;
  availability: ReturnType<typeof getBeneficioAvailabilityPresentation>;
  local: {
    nombre: string | null;
    logoUrl: string | null;
  };
};

export async function getPublicBenefitsPageData(page: number, pageSize: number) {
  const raw = await getPublicBenefitsCatalogRaw(page, pageSize);
  const total = Number(raw.total ?? 0);

  const beneficios: PublicBenefitCardData[] = (raw.beneficios ?? []).map((beneficio) => {
    const fechaExpiracion = new Date(beneficio.fechaExpiracion);
    const createdAt = new Date(beneficio.createdAt);
    const benefitState = evaluateBeneficioState({
      fechaExpiracion,
      maxUsos: beneficio.maxUsos,
      canjeados: beneficio.canjeados,
      diasValidos: beneficio.diasValidos,
    });

    return {
      ...beneficio,
      fechaExpiracion,
      createdAt,
      effectiveStatus: benefitState.status,
      availability: getBeneficioAvailabilityPresentation({
        status: benefitState.status,
        isWrongDay: benefitState.isWrongDay,
        diasValidos: beneficio.diasValidos,
      }),
    };
  });

  return {
    beneficios,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFeaturedPublicBenefits(limit: number) {
  const { beneficios, total } = await getPublicBenefitsPageData(1, limit);

  return {
    beneficios,
    total,
  };
}
