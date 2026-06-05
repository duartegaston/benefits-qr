import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type LocalConBeneficiosRaw = {
  id: string;
  nombre: string | null;
  logoUrl: string | null;
  lat: number;
  lng: number;
  rubroNombre: string | null;
  beneficiosCount: number;
};

async function _getLocalesConBeneficiosVigentesRaw(): Promise<LocalConBeneficiosRaw[]> {
  // Locales con al menos 1 beneficio público vigente (no expirado, no soft-deleted,
  // y con cupos disponibles) y con coordenadas cargadas.
  const rows = await prisma.$queryRaw<LocalConBeneficiosRaw[]>`
    WITH beneficio_stats_cte AS (
      SELECT
        r."beneficioId",
        COUNT(*) FILTER (WHERE r.estado = 'CANJEADO')::int AS canjeados
      FROM "Reclamo" r
      JOIN "Beneficio" b ON b.id = r."beneficioId"
      WHERE b."esPublico" = true AND b."deletedAt" IS NULL
      GROUP BY r."beneficioId"
    ),
    beneficios_vigentes AS (
      SELECT
        b."localId",
        COUNT(*)::int AS beneficios_count
      FROM "Beneficio" b
      LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
        AND b."fechaExpiracion" >= CURRENT_TIMESTAMP
        AND (b."maxUsos" IS NULL OR COALESCE(bs.canjeados, 0) < b."maxUsos")
      GROUP BY b."localId"
    )
    SELECT
      l.id,
      l.nombre,
      l."logoUrl",
      l.lat,
      l.lng,
      ru.nombre AS "rubroNombre",
      bv.beneficios_count AS "beneficiosCount"
    FROM "Local" l
    JOIN beneficios_vigentes bv ON bv."localId" = l.id
    LEFT JOIN "Rubro" ru ON ru.id = l."rubroId"
    WHERE l.lat IS NOT NULL
      AND l.lng IS NOT NULL
      AND l."isTest" = false
      AND l."active" = true
  `;

  return rows;
}

export const getLocalesConBeneficiosVigentesRaw = unstable_cache(
  _getLocalesConBeneficiosVigentesRaw,
  ["locales-con-beneficios-vigentes"],
  { revalidate: 60 }
);

async function _getTodosLocalesRaw(): Promise<LocalConBeneficiosRaw[]> {
  const rows = await prisma.$queryRaw<LocalConBeneficiosRaw[]>`
    WITH beneficio_stats_cte AS (
      SELECT
        r."beneficioId",
        COUNT(*) FILTER (WHERE r.estado = 'CANJEADO')::int AS canjeados
      FROM "Reclamo" r
      JOIN "Beneficio" b ON b.id = r."beneficioId"
      WHERE b."esPublico" = true AND b."deletedAt" IS NULL
      GROUP BY r."beneficioId"
    ),
    beneficios_vigentes AS (
      SELECT
        b."localId",
        COUNT(*)::int AS beneficios_count
      FROM "Beneficio" b
      LEFT JOIN beneficio_stats_cte bs ON bs."beneficioId" = b.id
      WHERE b."esPublico" = true
        AND b."deletedAt" IS NULL
        AND b."fechaExpiracion" >= CURRENT_TIMESTAMP
        AND (b."maxUsos" IS NULL OR COALESCE(bs.canjeados, 0) < b."maxUsos")
      GROUP BY b."localId"
    )
    SELECT
      l.id,
      l.nombre,
      l."logoUrl",
      l.lat,
      l.lng,
      ru.nombre AS "rubroNombre",
      COALESCE(bv.beneficios_count, 0) AS "beneficiosCount"
    FROM "Local" l
    LEFT JOIN beneficios_vigentes bv ON bv."localId" = l.id
    LEFT JOIN "Rubro" ru ON ru.id = l."rubroId"
    WHERE l.lat IS NOT NULL
      AND l.lng IS NOT NULL
      AND l."isTest" = false
      AND l."active" = true
  `;

  return rows;
}

export const getTodosLocalesRaw = unstable_cache(
  _getTodosLocalesRaw,
  ["todos-locales-mapa"],
  { revalidate: 60 }
);
