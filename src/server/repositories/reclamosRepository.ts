import { prisma } from "@/lib/prisma";
import { EstadoReclamo } from "@/generated/prisma/client";

export async function findBeneficioForReclamo(beneficioId: string) {
  return prisma.beneficio.findUnique({
    where: { id: beneficioId, deletedAt: null },
    include: { reclamos: { where: { estado: EstadoReclamo.CANJEADO }, select: { id: true } } },
  });
}

export async function findClienteByEmail(email: string) {
  return prisma.cliente.findUnique({ where: { email } });
}

export async function findClienteByPhone(phone: string) {
  return prisma.cliente.findUnique({ where: { phone } });
}

export async function findClienteById(clienteId: string) {
  return prisma.cliente.findUnique({ where: { id: clienteId } });
}

export async function createCliente(data: { nombre: string; email: string; phone: string }) {
  return prisma.cliente.create({ data });
}

export async function updateCliente(
  id: string,
  data: Partial<{ nombre: string; email: string; phone: string }>
) {
  return prisma.cliente.update({ where: { id }, data });
}

export async function findExistingReclamo(beneficioId: string, clienteId: string) {
  return prisma.reclamo.findFirst({
    where: { beneficioId, clienteId },
  });
}

export async function createReclamo(beneficioId: string, clienteId: string) {
  return prisma.reclamo.create({
    data: { beneficioId, clienteId },
  });
}

export async function createClienteAnonimo(data?: { nombre?: string }) {
  return prisma.cliente.create({ data: data ?? {} });
}

export async function findExistingReclamoPendiente(beneficioId: string, clienteId: string) {
  return prisma.reclamo.findFirst({
    where: { beneficioId, clienteId, estado: EstadoReclamo.PENDIENTE },
  });
}
