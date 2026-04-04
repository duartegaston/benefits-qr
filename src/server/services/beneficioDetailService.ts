import {
  expirePendingReclamos,
  getBeneficioDetailRaw,
} from "@/server/repositories/beneficioDetailRepository";

export async function getBeneficioDetailPageData(
  beneficioId: string,
  localId: string,
  page: number,
  pageSize: number
) {
  const raw = await getBeneficioDetailRaw(beneficioId, localId, page, pageSize);

  const beneficio = raw.beneficio
    ? {
        ...raw.beneficio,
        fechaExpiracion: new Date(raw.beneficio.fechaExpiracion),
        deletedAt: raw.beneficio.deletedAt ? new Date(raw.beneficio.deletedAt) : null,
      }
    : null;

  const stats = raw.stats ?? { total: 0, canjeados: 0, pendientes: 0 };
  const reclamos = (raw.reclamos ?? []).map((r) => ({
    ...r,
    fechaReclamo: new Date(r.fechaReclamo),
    fechaCanje: r.fechaCanje ? new Date(r.fechaCanje) : null,
  }));

  return {
    beneficio,
    stats,
    reclamos,
    totalPages: Math.ceil(stats.total / pageSize),
  };
}

export function expirePendingReclamosAsyncIfNeeded(
  beneficioId: string,
  isExpired: boolean,
  pendientes: number
) {
  if (!isExpired || pendientes <= 0) return;
  void expirePendingReclamos(beneficioId);
}
