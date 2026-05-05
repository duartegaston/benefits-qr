import { prisma } from "@/lib/prisma";
import { EstadoReclamo } from "@/generated/prisma/client";

export async function findBeneficiosByLocal(localId: string) {
  return prisma.beneficio.findMany({
    where: { localId },
    include: {
      _count: { select: { reclamos: true } },
      reclamos: { where: { estado: EstadoReclamo.CANJEADO }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBeneficio(data: {
  descripcion: string;
  fechaExpiracion: Date;
  maxUsos: number | null;
  diasValidos: number[];
  esPublico: boolean;
  requiereDatos: boolean;
  localId: string;
}) {
  return prisma.beneficio.create({ data });
}

export async function findBeneficioPublicById(id: string) {
  return prisma.beneficio.findUnique({
    where: { id, deletedAt: null },
    include: { local: { select: { nombre: true, logoUrl: true } } },
  });
}

export async function findBeneficioOwnedByLocal(id: string, localId: string) {
  return prisma.beneficio.findFirst({
    where: { id, localId, deletedAt: null },
  });
}

export async function softDeleteBeneficioAndDeleteReclamos(id: string) {
  await prisma.$transaction([
    prisma.reclamo.deleteMany({
      where: { beneficioId: id },
    }),
    prisma.beneficio.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
  ]);
}

export async function findBeneficioStatsByLocal(id: string, localId: string) {
  return prisma.beneficio.findFirst({
    where: { id, localId },
    include: {
      reclamos: {
        select: {
          id: true,
          estado: true,
          fechaReclamo: true,
          fechaCanje: true,
          cliente: { select: { email: true } },
        },
        orderBy: { fechaReclamo: "desc" },
      },
    },
  });
}
