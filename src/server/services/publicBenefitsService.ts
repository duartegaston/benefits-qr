import { evaluateBeneficioState, type BeneficioEffectiveStatus } from "@/lib/couponStatus";
import { getBeneficioAvailabilityPresentation } from "@/lib/statusPresentation";
import {
  getFeaturedPublicBenefitsRaw,
  getPublicBenefitsCatalogRaw,
  type PublicBenefitsCatalogRaw,
  type PublicBenefitsFiltersInput,
} from "@/server/repositories/publicBenefitsRepository";

export type { PublicBenefitsFiltersInput };

export type PublicBenefitCardData = {
  id: string;
  descripcion: string;
  fechaExpiracion: Date;
  maxUsos: number | null;
  diasValidos: number[];
  createdAt: Date;
  canjeados: number;
  effectiveStatus: BeneficioEffectiveStatus;
  availability: ReturnType<typeof getBeneficioAvailabilityPresentation>;
  local: {
    nombre: string | null;
    logoUrl: string | null;
    rubroNombre: string | null;
  };
};

function hydratePublicBenefits(raw: PublicBenefitsCatalogRaw) {
  return (raw.beneficios ?? []).map((beneficio) => {
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
    } satisfies PublicBenefitCardData;
  });
}

export async function getPublicBenefitsPageData(page: number, pageSize: number, filters: PublicBenefitsFiltersInput = {}) {
  const raw = await getPublicBenefitsCatalogRaw(page, pageSize, filters);
  const total = Number(raw.total ?? 0);
  const beneficios = hydratePublicBenefits(raw);

  return {
    beneficios,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFeaturedPublicBenefits(limit: number) {
  const raw = await getFeaturedPublicBenefitsRaw(limit);
  const beneficios = hydratePublicBenefits(raw);

  return {
    beneficios,
  };
}
