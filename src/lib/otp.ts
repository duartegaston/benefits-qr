import { prisma } from "@/lib/prisma";
import { sendOtpWhatsapp } from "@/lib/whatsapp";

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndSendOtp(phone: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await prisma.clienteOtp.upsert({
    where: { phone },
    update: { code, expiresAt },
    create: { phone, code, expiresAt },
  });

  await sendOtpWhatsapp(phone, code);
}
