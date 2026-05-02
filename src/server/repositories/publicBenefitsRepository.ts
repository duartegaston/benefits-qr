import { prisma } from "@/lib/prisma";

export type PublicBenefitsCatalogRaw = {
  beneficios: Array<{
    id: string;
    descripcion: string;
    fechaExpiracion: string;
    maxUsos: number | null;
    diasValidos: number[];
    requiereDatos: boolean;
    createdAt: string;
    canjeados: number;
    local: {
      nombre: string | null;
      logoUrl: string | null;
    };
  }> | null;
  total: number;
};

export async function getPublicBenefitsCatalogRaw(
  page: number,
  pageSize: number
): Promise<PublicBenefitsCatalogRaw> {
  const offset = Math.max(0, (page - 1) * pageSize);

  const [raw] = await prisma.$queryRaw<[PublicBenefitsCatalogRaw]>`
    WITH paged_beneficios_cte AS (
      SELECT
        b.id,
        b.descripcion,
        b."fechaExpiracion",
        b."maxUsos",
        b."diasValidos",
        b."requiereDatos",
        b."createdAt",
        l.nombre AS "localNombre",
        l."logoUrl" AS "localLogoUrl"
      FROM "Beneficio" b
      JOIN "Local" l ON l.id = b."localId"
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
      ORDER BY b."createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset}
    ),
    beneficio_stats_cte AS (
      SELECT
        r."beneficioId",
        COUNT(*) FILTER (WHERE r.estado = 'CANJEADO')::int AS canjeados
      FROM "Reclamo" r
      JOIN paged_beneficios_cte b ON b.id = r."beneficioId"
      GROUP BY r."beneficioId"
    ),
    total_cte AS (
      SELECT COUNT(*)::int AS total
      FROM "Beneficio"
      WHERE "esPublico" = true
        AND "deletedAt" IS NULL
    )
    SELECT
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', b.id,
              'descripcion', b.descripcion,
              'fechaExpiracion', b."fechaExpiracion",
              'maxUsos', b."maxUsos",
              'diasValidos', b."diasValidos",
              'requiereDatos', b."requiereDatos",
              'createdAt', b."createdAt",
              'canjeados', COALESCE(bs.canjeados, 0),
              'local', json_build_object(
                'nombre', b."localNombre",
                'logoUrl', b."localLogoUrl"
              )
            )
            ORDER BY b."createdAt" DESC
          )
          FROM paged_beneficios_cte b
          LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
        ),
        '[]'::json
      ) AS beneficios,
      COALESCE((SELECT total FROM total_cte), 0) AS total
  `;

  return raw;
}
