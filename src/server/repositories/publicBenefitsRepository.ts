import { unstable_cache } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicBenefitsFiltersInput = {
  q?: string;
  rubroId?: string;
  soloHoy?: boolean;
  soloDisponibles?: boolean;
};

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
      rubroNombre: string | null;
    };
  }> | null;
  total: number;
};

const AVAILABLE_CONDITION = Prisma.sql`
  b."fechaExpiracion" >= CURRENT_TIMESTAMP
  AND (b."maxUsos" IS NULL OR COALESCE(bs.canjeados, 0) < b."maxUsos")
`;

async function _getPublicBenefitsCatalogRaw(
  page: number,
  pageSize: number,
  filters: PublicBenefitsFiltersInput = {}
): Promise<PublicBenefitsCatalogRaw> {
  const offset = Math.max(0, (page - 1) * pageSize);

  const nombreFilter = filters.q
    ? Prisma.sql`AND l.nombre ILIKE ${"% " + filters.q + "%"}`
    : Prisma.empty;

  // rubroId from the URL is a string; cast to int to match the column type
  const rubroFilter = filters.rubroId
    ? Prisma.sql`AND l."rubroId" = ${parseInt(filters.rubroId, 10)}`
    : Prisma.empty;

  const soloHoyFilter = filters.soloHoy
    ? Prisma.sql`AND (
        array_length(b."diasValidos", 1) IS NULL
        OR array_length(b."diasValidos", 1) = 0
        OR EXTRACT(DOW FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires')::int = ANY(b."diasValidos")
      )`
    : Prisma.empty;

  const soloDisponiblesFilter = filters.soloDisponibles
    ? Prisma.sql`AND (${AVAILABLE_CONDITION})`
    : Prisma.empty;

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
        ru.nombre AS "localRubroNombre",
        (${AVAILABLE_CONDITION}) AS "isAvailable"
      FROM "Beneficio" b
      JOIN "Local" l ON l.id = b."localId"
      LEFT JOIN "Rubro" ru ON ru.id = l."rubroId"
      LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
        ${nombreFilter}
        ${rubroFilter}
        ${soloHoyFilter}
        ${soloDisponiblesFilter}
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
                'logoUrl', b."localLogoUrl",
                'rubroNombre', b."localRubroNombre"
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

// Cached version: 60s TTL, keyed by (page, pageSize, filters).
// The raw response is fully JSON-serializable (DB returns dates as ISO strings).
// Hydration (string → Date) happens in the service layer after cache hit.
export const getPublicBenefitsCatalogRaw = unstable_cache(
  _getPublicBenefitsCatalogRaw,
  ["public-benefits-catalog-raw"],
  { revalidate: 60 }
);

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
        l."logoUrl" AS "localLogoUrl",
        ru.nombre AS "localRubroNombre"
      FROM "Beneficio" b
      JOIN "Local" l ON l.id = b."localId"
      LEFT JOIN "Rubro" ru ON ru.id = l."rubroId"
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
                'logoUrl', b."localLogoUrl",
                'rubroNombre', b."localRubroNombre"
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
