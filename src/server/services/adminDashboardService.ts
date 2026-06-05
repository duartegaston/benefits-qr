import {
  getAdminDailyTrafficRaw,
  getAdminKpiRaw,
} from "@/server/repositories/adminDashboardRepository";

export type AdminDashboardData = {
  kpi: {
    totalLocales: number;
    localesNuevos7d: number;
    localesNuevos30d: number;
    totalCupones: number;
    cuponesActivos: number;
    cuponesVencidos: number;
    cuponesAgotados: number;
    cuponesEliminados: number;
    activosPublicos: number;
    activosPrivados: number;
    localesConActivosPublicos: number;
    localesConActivosPrivados: number;
    localesSinCupones: number;
    totalReclamos: number;
    totalCanjes: number;
    clientesUnicos: number;
    pageviews30d: number;
    visitantesUnicos30d: number;
    tasaCanje: number;
  };
  topLocalesPorCupones: Array<{
    localId: string;
    nombre: string;
    totalCupones: number;
    cuponesActivos: number;
    activosPublicos: number;
    activosPrivados: number;
  }>;
  topPaths: Array<{
    path: string;
    pageviews: number;
    visitantesUnicos: number;
  }>;
  trafficTrend: Array<{
    date: string;
    pageviews: number;
    visitantesUnicos: number;
  }>;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [kpiRaw, trafficTrend] = await Promise.all([
    getAdminKpiRaw(),
    getAdminDailyTrafficRaw(),
  ]);

  const totalReclamos = Number(kpiRaw.kpi.totalReclamos ?? 0);
  const totalCanjes = Number(kpiRaw.kpi.totalCanjes ?? 0);
  const tasaCanje =
    totalReclamos > 0 ? Math.round((totalCanjes / totalReclamos) * 100) : 0;

  return {
    kpi: {
      ...kpiRaw.kpi,
      tasaCanje,
    },
    topLocalesPorCupones: (kpiRaw.topLocalesPorCupones ?? []).map((local) => ({
      ...local,
      nombre: local.nombre?.trim() || "Local sin nombre",
    })),
    topPaths: kpiRaw.topPaths ?? [],
    trafficTrend: trafficTrend ?? [],
  };
}
