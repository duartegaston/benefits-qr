import { getDashboardRaw } from "@/server/repositories/dashboardRepository";
import { evaluateBeneficioState, type BeneficioEffectiveStatus } from "@/lib/couponStatus";
import { parseRawDbTimestamp } from "@/lib/dates";

export type BeneficioRow = {
  id: string;
  descripcion: string;
  fechaExpiracion: Date;
  maxUsos: number | null;
  diasValidos: number[];
  totalReclamos: number;
  canjeados: number;
  effectiveStatus: BeneficioEffectiveStatus;
};

export async function getDashboardPageData(
  localId: string,
  page: number,
  pageSize: number
) {
  const raw = await getDashboardRaw(localId, page, pageSize);

  const local = raw.local;
  const totalBeneficios = Number(raw.totalBeneficios ?? 0);
  const reclamoStats = raw.reclamoStats ?? { total: 0, canjeados: 0 };
  const totalReclamos = Number(reclamoStats.total);
  const totalCanjeados = Number(reclamoStats.canjeados);
  const clientesUnicos = Number(raw.clientesUnicos ?? 0);
  const cuponesActivos = Number(raw.cuponesActivos ?? 0);
  const proximosAVencer = Number(raw.proximosAVencer ?? 0);
  const tasaCanje = totalReclamos > 0 ? Math.round((totalCanjeados / totalReclamos) * 100) : 0;

  const beneficios: BeneficioRow[] = (raw.beneficios ?? []).map((b) => {
    const fechaExpiracion = parseRawDbTimestamp(b.fechaExpiracion);
    const beneficioState = evaluateBeneficioState({
      fechaExpiracion,
      deletedAt: null,
      maxUsos: b.maxUsos,
      canjeados: b.canjeados,
      diasValidos: b.diasValidos,
    });

    return {
      ...b,
      fechaExpiracion,
      effectiveStatus: beneficioState.status,
    };
  });

  return {
    local,
    beneficios,
    totalBeneficios,
    totalReclamos,
    totalCanjeados,
    clientesUnicos,
    cuponesActivos,
    proximosAVencer,
    tasaCanje,
    totalPages: Math.ceil(totalBeneficios / pageSize),
  };
}
