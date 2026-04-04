import { getDashboardRaw } from "@/server/repositories/dashboardRepository";

export type BeneficioRow = {
  id: string;
  descripcion: string;
  fechaExpiracion: Date;
  maxUsos: number | null;
  diasValidos: number[];
  createdAt: Date;
  totalReclamos: number;
  canjeados: number;
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

  const beneficios: BeneficioRow[] = (raw.beneficios ?? []).map((b) => ({
    ...b,
    fechaExpiracion: new Date(b.fechaExpiracion),
    createdAt: new Date(b.createdAt),
  }));

  return {
    local,
    beneficios,
    totalBeneficios,
    totalReclamos,
    totalCanjeados,
    totalPages: Math.ceil(totalBeneficios / pageSize),
  };
}
