import { prisma } from "@/lib/prisma";

export async function findClienteByEmail(email: string) {
  return prisma.cliente.findUnique({ where: { email } });
}

export async function createClienteByEmail(email: string) {
  return prisma.cliente.create({ data: { email } });
}

export async function findLocalByEmail(email: string) {
  return prisma.local.findUnique({ where: { email } });
}

export async function createLocalByEmail(email: string) {
  return prisma.local.create({ data: { email } });
}

export async function upsertLocalOtp(
  email: string,
  code: string,
  expiresAt: Date,
  pendingApproval: boolean
) {
  return prisma.localOtp.upsert({
    where: { email },
    update: { code, expiresAt, pendingApproval },
    create: { email, code, expiresAt, pendingApproval },
  });
}

export async function findLocalOtpByEmail(email: string) {
  return prisma.localOtp.findUnique({ where: { email } });
}

export async function deleteLocalOtpByEmail(email: string) {
  await prisma.localOtp.delete({ where: { email } });
}

