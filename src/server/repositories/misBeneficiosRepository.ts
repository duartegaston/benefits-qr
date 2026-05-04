import { prisma } from "@/lib/prisma";
import type { EstadoReclamo } from "@/lib/enums";

export type ReclamoRow = {
  id: string;
  estado: EstadoReclamo;
  fechaReclamo: Date;
  fechaCanje: Date | null;
  beneficioDescripcion: string;
  beneficioFechaExpiracion: Date;
  beneficioDeletedAt: Date | null;
  beneficioDiasValidos: number[];
  beneficioMaxUsos: number | null;
  beneficioCanjeados: number;
  localNombre: string | null;
  localId: string;
  localLogoV: string;
  localRubroNombre: string | null;
  totalCount: number;
};

export type ReclamoStatusRow = Omit<ReclamoRow, "totalCount">;

export async function getMisBeneficiosRows(
  clienteId: string,
  page: number,
  pageSize: number
): Promise<ReclamoRow[]> {
  return prisma.$queryRaw<ReclamoRow[]>`
    SELECT
      r.id,
      r.estado,
      r."fechaReclamo",
      r."fechaCanje",
      b.descripcion           AS "beneficioDescripcion",
      b."fechaExpiracion"     AS "beneficioFechaExpiracion",
      b."deletedAt"           AS "beneficioDeletedAt",
      b."diasValidos"         AS "beneficioDiasValidos",
      b."maxUsos"             AS "beneficioMaxUsos",
      (
        SELECT COUNT(*)::int
        FROM "Reclamo" rc
        WHERE rc."beneficioId" = b.id
          AND rc.estado = 'CANJEADO'
      )                       AS "beneficioCanjeados",
      l.nombre                AS "localNombre",
      l.id                    AS "localId",
      LEFT(MD5(COALESCE(l."logoUrl", '')), 8) AS "localLogoV",
      ru.nombre               AS "localRubroNombre",
      COUNT(*) OVER ()::int   AS "totalCount"
    FROM "Reclamo" r
    JOIN "Beneficio" b ON b.id = r."beneficioId"
    JOIN "Local"     l ON l.id = b."localId"
    LEFT JOIN "Rubro" ru ON ru.id = l."rubroId"
    WHERE r."clienteId" = ${clienteId}
    ORDER BY r."fechaReclamo" DESC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;
}

export async function getMisBeneficioRow(
  clienteId: string,
  reclamoId: string
): Promise<ReclamoStatusRow | null> {
  const [row] = await prisma.$queryRaw<ReclamoStatusRow[]>`
    SELECT
      r.id,
      r.estado,
      r."fechaReclamo",
      r."fechaCanje",
      b.descripcion           AS "beneficioDescripcion",
      b."fechaExpiracion"     AS "beneficioFechaExpiracion",
      b."deletedAt"           AS "beneficioDeletedAt",
      b."diasValidos"         AS "beneficioDiasValidos",
      b."maxUsos"             AS "beneficioMaxUsos",
      (
        SELECT COUNT(*)::int
        FROM "Reclamo" rc
        WHERE rc."beneficioId" = b.id
          AND rc.estado = 'CANJEADO'
      )                       AS "beneficioCanjeados",
      l.nombre                AS "localNombre",
      l.id                    AS "localId",
      LEFT(MD5(COALESCE(l."logoUrl", '')), 8) AS "localLogoV",
      ru.nombre               AS "localRubroNombre"
    FROM "Reclamo" r
    JOIN "Beneficio" b ON b.id = r."beneficioId"
    JOIN "Local"     l ON l.id = b."localId"
    LEFT JOIN "Rubro" ru ON ru.id = l."rubroId"
    WHERE r."clienteId" = ${clienteId}
      AND r.id = ${reclamoId}
    LIMIT 1
  `;

  return row ?? null;
}
