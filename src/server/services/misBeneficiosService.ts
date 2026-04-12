import { getMisBeneficiosRows } from "@/server/repositories/misBeneficiosRepository";
import {
  evaluateReclamoState,
  getCouponBlockMessage,
  ReclamoEffectiveStatus,
} from "@/lib/couponStatus";

export async function getMisBeneficiosPageData(
  clienteId: string,
  page: number,
  pageSize: number
) {
  const rows = await getMisBeneficiosRows(clienteId, page, pageSize);
  const total = rows[0]?.totalCount ?? 0;

  const reclamos = rows.map((r) => {
    const reclamoState = evaluateReclamoState({
      estado: r.estado,
      fechaExpiracion: r.beneficioFechaExpiracion,
      deletedAt: r.beneficioDeletedAt,
      maxUsos: r.beneficioMaxUsos,
      canjeados: r.beneficioCanjeados,
      diasValidos: r.beneficioDiasValidos,
    });

    return {
      id: r.id,
      effectiveStatus: reclamoState.status,
      canShowQr: reclamoState.canGenerateQr,
      blockedMessage:
        reclamoState.canGenerateQr ||
        (reclamoState.status !== ReclamoEffectiveStatus.PENDIENTE &&
          reclamoState.status !== ReclamoEffectiveStatus.AGOTADO)
        ? null
        : getCouponBlockMessage(reclamoState.blockReason, {
            diasValidos: r.beneficioDiasValidos,
            context: "redeem",
          }),
      fechaReclamo: r.fechaReclamo,
      fechaCanje: r.fechaCanje,
      beneficio: {
        descripcion: r.beneficioDescripcion,
        fechaExpiracion: r.beneficioFechaExpiracion,
        local: { nombre: r.localNombre, id: r.localId },
      },
    };
  });

  return {
    reclamos,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}
