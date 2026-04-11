import { getMisBeneficiosRows } from "@/server/repositories/misBeneficiosRepository";

export async function getMisBeneficiosPageData(
  clienteId: string,
  page: number,
  pageSize: number
) {
  const rows = await getMisBeneficiosRows(clienteId, page, pageSize);
  const total = rows[0]?.totalCount ?? 0;

  const reclamos = rows.map((r) => ({
    id: r.id,
    estado: r.estado,
    fechaReclamo: r.fechaReclamo,
    fechaCanje: r.fechaCanje,
    beneficio: {
      descripcion: r.beneficioDescripcion,
      fechaExpiracion: r.beneficioFechaExpiracion,
      diasValidos: r.beneficioDiasValidos,
      local: { nombre: r.localNombre, logoUrl: r.localLogoUrl },
    },
  }));

  return {
    reclamos,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}
