import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpWhatsapp } from "@/lib/whatsapp";
import { sendClienteOtpEmail } from "@/lib/email";

/** Generates a cryptographically secure 6-digit OTP code. */
export function generateOtpCode(): string {
  return randomInt(100000, 1000000).toString();
}

export async function createAndSendOtp(contact: { email: string } | { phone: string }) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  if ("email" in contact) {
    await prisma.clienteOtp.upsert({
      where: { email: contact.email },
      update: { code, expiresAt },
      create: { email: contact.email, code, expiresAt },
    });
    await sendClienteOtpEmail(contact.email, code);
  } else {
    await prisma.clienteOtp.upsert({
      where: { phone: contact.phone },
      update: { code, expiresAt },
      create: { phone: contact.phone, code, expiresAt },
    });
    await sendOtpWhatsapp(contact.phone, code);
  }
}
