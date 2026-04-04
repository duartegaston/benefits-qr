import { countMisBeneficios, getMisBeneficiosRows } from "@/server/repositories/misBeneficiosRepository";

export async function getMisBeneficiosPageData(
  clienteId: string,
  page: number,
  pageSize: number
) {
  const [rows, total] = await Promise.all([
    getMisBeneficiosRows(clienteId, page, pageSize),
    countMisBeneficios(clienteId),
  ]);

  const reclamos = rows.map((r) => ({
    id: r.id,
    estado: r.estado,
    fechaReclamo: r.fechaReclamo,
    fechaCanje: r.fechaCanje,
    beneficio: {
      descripcion: r.beneficioDescripcion,
      fechaExpiracion: r.beneficioFechaExpiracion,
      local: { nombre: r.localNombre, logoUrl: r.localLogoUrl },
    },
  }));

  return {
    reclamos,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
