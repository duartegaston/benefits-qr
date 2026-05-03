import { Prisma } from "@/generated/prisma/client";
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

const AVAILABLE_CONDITION = Prisma.sql`
  b."fechaExpiracion" >= CURRENT_TIMESTAMP
  AND (b."maxUsos" IS NULL OR COALESCE(bs.canjeados, 0) < b."maxUsos")
`;

export async function getPublicBenefitsCatalogRaw(
  page: number,
  pageSize: number
): Promise<PublicBenefitsCatalogRaw> {
  const offset = Math.max(0, (page - 1) * pageSize);

  const [raw] = await prisma.$queryRaw<[PublicBenefitsCatalogRaw]>`
    WITH beneficio_stats_cte AS (
      SELECT
        r."beneficioId",
        COUNT(*) FILTER (WHERE r.estado = 'CANJEADO')::int AS canjeados
      FROM "Reclamo" r
      JOIN "Beneficio" b ON b.id = r."beneficioId"
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
      GROUP BY r."beneficioId"
    ),
    filtered_beneficios_cte AS (
      SELECT
        b.id,
        b.descripcion,
        b."fechaExpiracion",
        b."maxUsos",
        b."diasValidos",
        b."requiereDatos",
        b."createdAt",
        COALESCE(bs.canjeados, 0) AS canjeados,
        l.nombre AS "localNombre",
        l."logoUrl" AS "localLogoUrl",
        (${AVAILABLE_CONDITION}) AS "isAvailable"
      FROM "Beneficio" b
      JOIN "Local" l ON l.id = b."localId"
      LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
    ),
    paged_beneficios_cte AS (
      SELECT *
      FROM filtered_beneficios_cte
      ORDER BY "isAvailable" DESC, "createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset}
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
              'canjeados', b.canjeados,
              'local', json_build_object(
                'nombre', b."localNombre",
                'logoUrl', b."localLogoUrl"
              )
            )
            ORDER BY b."isAvailable" DESC, b."createdAt" DESC
          )
          FROM paged_beneficios_cte b
        ),
        '[]'::json
      ) AS beneficios,
      COALESCE((SELECT COUNT(*)::int FROM filtered_beneficios_cte), 0) AS total
  `;

  return raw;
}

export async function getAvailableFeaturedPublicBenefitsRaw(limit: number): Promise<PublicBenefitsCatalogRaw> {
  const [raw] = await prisma.$queryRaw<[PublicBenefitsCatalogRaw]>`
    WITH beneficio_stats_cte AS (
      SELECT
        r."beneficioId",
        COUNT(*) FILTER (WHERE r.estado = 'CANJEADO')::int AS canjeados
      FROM "Reclamo" r
      JOIN "Beneficio" b ON b.id = r."beneficioId"
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
      GROUP BY r."beneficioId"
    ),
    featured_beneficios_cte AS (
      SELECT
        b.id,
        b.descripcion,
        b."fechaExpiracion",
        b."maxUsos",
        b."diasValidos",
        b."requiereDatos",
        b."createdAt",
        COALESCE(bs.canjeados, 0) AS canjeados,
        l.nombre AS "localNombre",
        l."logoUrl" AS "localLogoUrl"
      FROM "Beneficio" b
      JOIN "Local" l ON l.id = b."localId"
      LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
        AND ${AVAILABLE_CONDITION}
      ORDER BY b."createdAt" DESC
      LIMIT ${limit}
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
              'canjeados', b.canjeados,
              'local', json_build_object(
                'nombre', b."localNombre",
                'logoUrl', b."localLogoUrl"
              )
            )
            ORDER BY b."createdAt" DESC
          )
          FROM featured_beneficios_cte b
        ),
        '[]'::json
      ) AS beneficios,
      0 AS total
  `;

  return raw;
}
