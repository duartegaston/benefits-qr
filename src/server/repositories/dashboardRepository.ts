import { prisma } from "@/lib/prisma";

export type DashboardRaw = {
  local: {
    id: string;
    nombre: string | null;
    email: string;
    logoUrl: string | null;
  } | null;
  beneficios: Array<{
    id: string;
    descripcion: string;
    fechaExpiracion: string;
    maxUsos: number | null;
    diasValidos: number[];
    createdAt: string;
    totalReclamos: number;
    canjeados: number;
  }> | null;
  totalBeneficios: number;
  reclamoStats: {
    total: number;
    canjeados: number;
  } | null;
};

export async function getDashboardRaw(
  localId: string,
  page: number,
  pageSize: number
): Promise<DashboardRaw> {
  const [raw] = await prisma.$queryRaw<[DashboardRaw]>`
    WITH
      local_cte AS (
        SELECT id, nombre, email, "logoUrl"
        FROM "Local"
        WHERE id = ${localId}
      ),
      beneficios_cte AS (
        SELECT
          b.id,
          b.descripcion,
          b."fechaExpiracion",
          b."maxUsos",
          b."diasValidos",
          b."createdAt",
          COUNT(r.id)::int                                          AS "totalReclamos",
          COUNT(r.id) FILTER (WHERE r.estado = 'CANJEADO')::int    AS "canjeados"
        FROM "Beneficio" b
        LEFT JOIN "Reclamo" r ON r."beneficioId" = b.id
        WHERE b."localId" = ${localId}
          AND b."deletedAt" IS NULL
        GROUP BY b.id
        ORDER BY b."createdAt" DESC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
      ),
      total_cte AS (
        SELECT COUNT(*)::int AS count
        FROM "Beneficio"
        WHERE "localId" = ${localId}
          AND "deletedAt" IS NULL
      ),
      reclamo_stats_cte AS (
        SELECT
          COUNT(r.id)::int                                          AS total,
          COUNT(r.id) FILTER (WHERE r.estado = 'CANJEADO')::int    AS canjeados
        FROM "Reclamo" r
        JOIN "Beneficio" b ON r."beneficioId" = b.id
        WHERE b."localId" = ${localId}
      )
    SELECT
      (SELECT row_to_json(l) FROM local_cte l)                                              AS local,
      COALESCE(
        (SELECT json_agg(b ORDER BY b."createdAt" DESC) FROM beneficios_cte b),
        '[]'::json
      )                                                                                     AS beneficios,
      (SELECT count FROM total_cte)                                                         AS "totalBeneficios",
      COALESCE(
        (SELECT row_to_json(rs) FROM reclamo_stats_cte rs),
        '{"total":0,"canjeados":0}'::json
      )                                                                                     AS "reclamoStats"
  `;

  return raw;
}
