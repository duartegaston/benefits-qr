import { prisma } from "@/lib/prisma";

export async function updateLocalProfile(
  localId: string,
  data: { nombre: string; direccion: string | null; telefono: string | null }
) {
  return prisma.local.update({
    where: { id: localId },
    data,
  });
}

export async function updateLocalLogo(localId: string, logoUrl: string) {
  await prisma.local.update({
    where: { id: localId },
    data: { logoUrl },
  });
}

export async function findReclamosByCliente(clienteId: string) {
  return prisma.reclamo.findMany({
    where: { clienteId },
    include: {
      beneficio: {
        include: { local: { select: { nombre: true, logoUrl: true } } },
      },
    },
    orderBy: { fechaReclamo: "desc" },
  });
}
