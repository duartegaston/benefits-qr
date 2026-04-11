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
  localNombre: string | null;
  localLogoUrl: string | null;
  totalCount: number;
};

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
      l.nombre                AS "localNombre",
      l."logoUrl"             AS "localLogoUrl",
      COUNT(*) OVER ()::int   AS "totalCount"
    FROM "Reclamo" r
    JOIN "Beneficio" b ON b.id = r."beneficioId"
    JOIN "Local"     l ON l.id = b."localId"
    WHERE r."clienteId" = ${clienteId}
    ORDER BY r."fechaReclamo" DESC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;
}
