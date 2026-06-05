import { prisma } from "@/lib/prisma";

export type AdminKpiRaw = {
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
};

export type LocalCuponCountRaw = {
  localId: string;
  nombre: string | null;
  totalCupones: number;
  cuponesActivos: number;
  activosPublicos: number;
  activosPrivados: number;
};

export type PathTrafficRaw = {
  path: string;
  pageviews: number;
  visitantesUnicos: number;
};

export type DailyTrafficRaw = {
  date: string;
  pageviews: number;
  visitantesUnicos: number;
};

type AdminKpiResult = {
  kpi: AdminKpiRaw;
  topLocalesPorCupones: LocalCuponCountRaw[];
  topPaths: PathTrafficRaw[];
};

export async function getAdminKpiRaw(): Promise<AdminKpiResult> {
  const [raw] = await prisma.$queryRaw<[AdminKpiResult]>`
    WITH beneficio_canjeados AS (
      SELECT
        b.id AS "beneficioId",
        COUNT(r.id) FILTER (WHERE r.estado = 'CANJEADO')::int AS canjeados
      FROM "Beneficio" b
      LEFT JOIN "Reclamo" r ON r."beneficioId" = b.id
      GROUP BY b.id
    ),
    beneficio_flags AS (
      SELECT
        b.id,
        b."localId",
        b."esPublico",
        b."deletedAt",
        b."fechaExpiracion",
        b."maxUsos",
        COALESCE(bc.canjeados, 0) AS canjeados,
        (
          b."deletedAt" IS NULL
          AND b."fechaExpiracion" > NOW()
          AND (b."maxUsos" IS NULL OR COALESCE(bc.canjeados, 0) < b."maxUsos")
        ) AS activo
      FROM "Beneficio" b
      LEFT JOIN beneficio_canjeados bc ON bc."beneficioId" = b.id
    ),
    base_kpi AS (
      SELECT
        (SELECT COUNT(*)::int FROM "Local") AS "totalLocales",
        (SELECT COUNT(*)::int FROM "Local" WHERE "createdAt" >= NOW() - INTERVAL '7 days') AS "localesNuevos7d",
        (SELECT COUNT(*)::int FROM "Local" WHERE "createdAt" >= NOW() - INTERVAL '30 days') AS "localesNuevos30d",
        (SELECT COUNT(*)::int FROM "Beneficio" WHERE "deletedAt" IS NULL) AS "totalCupones",
        (SELECT COUNT(*)::int FROM beneficio_flags bf WHERE bf.activo) AS "cuponesActivos",
        (SELECT COUNT(*)::int FROM beneficio_flags bf WHERE bf."deletedAt" IS NULL AND bf."fechaExpiracion" <= NOW()) AS "cuponesVencidos",
        (SELECT COUNT(*)::int FROM beneficio_flags bf WHERE bf."deletedAt" IS NULL AND bf."maxUsos" IS NOT NULL AND bf.canjeados >= bf."maxUsos") AS "cuponesAgotados",
        (SELECT COUNT(*)::int FROM "Beneficio" WHERE "deletedAt" IS NOT NULL) AS "cuponesEliminados",
        (SELECT COUNT(*)::int FROM beneficio_flags bf WHERE bf.activo AND bf."esPublico" = true) AS "activosPublicos",
        (SELECT COUNT(*)::int FROM beneficio_flags bf WHERE bf.activo AND bf."esPublico" = false) AS "activosPrivados",
        (SELECT COUNT(DISTINCT bf."localId")::int FROM beneficio_flags bf WHERE bf.activo AND bf."esPublico" = true) AS "localesConActivosPublicos",
        (SELECT COUNT(DISTINCT bf."localId")::int FROM beneficio_flags bf WHERE bf.activo AND bf."esPublico" = false) AS "localesConActivosPrivados",
        (
          SELECT COUNT(*)::int
          FROM "Local" l
          LEFT JOIN "Beneficio" b ON b."localId" = l.id AND b."deletedAt" IS NULL
          WHERE b.id IS NULL
        ) AS "localesSinCupones",
        (SELECT COUNT(*)::int FROM "Reclamo") AS "totalReclamos",
        (SELECT COUNT(*)::int FROM "Reclamo" WHERE estado = 'CANJEADO') AS "totalCanjes",
        (SELECT COUNT(DISTINCT "clienteId")::int FROM "Reclamo") AS "clientesUnicos",
        (SELECT COUNT(*)::int FROM "SitePageview" sp WHERE sp."createdAt" >= NOW() - INTERVAL '30 days') AS "pageviews30d",
        (SELECT COUNT(DISTINCT CONCAT(sp."visitorHash", ':', sp."visitedOn"))::int FROM "SitePageview" sp WHERE sp."createdAt" >= NOW() - INTERVAL '30 days') AS "visitantesUnicos30d"
    ),
    top_locales AS (
      SELECT
        l.id AS "localId",
        l.nombre,
        COUNT(b.id) FILTER (WHERE b."deletedAt" IS NULL)::int AS "totalCupones",
        COUNT(b.id) FILTER (
          WHERE b."deletedAt" IS NULL
            AND b."fechaExpiracion" > NOW()
            AND (b."maxUsos" IS NULL OR COALESCE(bc.canjeados, 0) < b."maxUsos")
        )::int AS "cuponesActivos",
        COUNT(b.id) FILTER (
          WHERE b."deletedAt" IS NULL
            AND b."esPublico" = true
            AND b."fechaExpiracion" > NOW()
            AND (b."maxUsos" IS NULL OR COALESCE(bc.canjeados, 0) < b."maxUsos")
        )::int AS "activosPublicos",
        COUNT(b.id) FILTER (
          WHERE b."deletedAt" IS NULL
            AND b."esPublico" = false
            AND b."fechaExpiracion" > NOW()
            AND (b."maxUsos" IS NULL OR COALESCE(bc.canjeados, 0) < b."maxUsos")
        )::int AS "activosPrivados"
      FROM "Local" l
      LEFT JOIN "Beneficio" b ON b."localId" = l.id
      LEFT JOIN beneficio_canjeados bc ON bc."beneficioId" = b.id
      GROUP BY l.id, l.nombre
      ORDER BY "totalCupones" DESC, "cuponesActivos" DESC
      LIMIT 10
    ),
    top_paths AS (
      SELECT
        sp.path,
        COUNT(*)::int AS pageviews,
        COUNT(DISTINCT CONCAT(sp."visitorHash", ':', sp."visitedOn"))::int AS "visitantesUnicos"
      FROM "SitePageview" sp
      WHERE sp."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY sp.path
      ORDER BY pageviews DESC
      LIMIT 8
    )
    SELECT
      (SELECT row_to_json(bk) FROM base_kpi bk) AS kpi,
      COALESCE(
        (SELECT json_agg(row_to_json(tl)) FROM top_locales tl),
        '[]'::json
      ) AS "topLocalesPorCupones",
      COALESCE(
        (SELECT json_agg(row_to_json(tp)) FROM top_paths tp),
        '[]'::json
      ) AS "topPaths"
  `;

  return raw;
}

export async function getAdminDailyTrafficRaw(): Promise<DailyTrafficRaw[]> {
  return prisma.$queryRaw<DailyTrafficRaw[]>`
    WITH days AS (
      SELECT d::date AS date
      FROM generate_series(
        (NOW() - INTERVAL '29 days')::date,
        NOW()::date,
        '1 day'
      ) AS d
    )
    SELECT
      days.date::text AS date,
      COALESCE(COUNT(sp.id), 0)::int AS pageviews,
      COALESCE(COUNT(DISTINCT CONCAT(sp."visitorHash", ':', sp."visitedOn")), 0)::int AS "visitantesUnicos"
    FROM days
    LEFT JOIN "SitePageview" sp ON sp."visitedOn" = days.date
    GROUP BY days.date
    ORDER BY days.date
  `;
}
