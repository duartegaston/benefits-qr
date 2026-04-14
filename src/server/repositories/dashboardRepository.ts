import { prisma } from "@/lib/prisma";

export type DashboardRaw = {
  local: {
    id: string;
    nombre: string | null;
    email: string;
    logoUrl: string | null;
    direccion: string | null;
    telefono: string | null;
  } | null;
  beneficios: Array<{
    id: string;
    descripcion: string;
    fechaExpiracion: string;
    maxUsos: number | null;
    diasValidos: number[];
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
        SELECT id, nombre, email, "logoUrl", direccion, telefono
        FROM "Local"
        WHERE id = ${localId}
      ),
      paged_beneficios_cte AS (
        SELECT
          b.id,
          b.descripcion,
          b."fechaExpiracion",
          b."maxUsos",
          b."diasValidos",
          b."createdAt"
        FROM "Beneficio" b
        WHERE b."localId" = ${localId}
          AND b."deletedAt" IS NULL
        ORDER BY b."createdAt" DESC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
      ),
      beneficio_stats_cte AS (
        SELECT
          r."beneficioId",
          COUNT(*)::int                                          AS "totalReclamos",
          COUNT(*) FILTER (WHERE r.estado = 'CANJEADO')::int    AS "canjeados"
        FROM "Reclamo" r
        JOIN paged_beneficios_cte b ON b.id = r."beneficioId"
        GROUP BY r."beneficioId"
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
        (
          SELECT json_agg(
            json_build_object(
              'id', b.id,
              'descripcion', b.descripcion,
              'fechaExpiracion', b."fechaExpiracion",
              'maxUsos', b."maxUsos",
              'diasValidos', b."diasValidos",
              'totalReclamos', COALESCE(bs."totalReclamos", 0),
              'canjeados', COALESCE(bs."canjeados", 0)
            )
            ORDER BY b."createdAt" DESC
          )
          FROM paged_beneficios_cte b
          LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
        ),
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
