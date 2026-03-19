import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.localOtp.upsert({
    where: { email: normalized },
    update: { code, expiresAt },
    create: { email: normalized, code, expiresAt },
  });

  try {
    await sendOtpEmail(normalized, code);
  } catch (err) {
    console.error("[request-otp] Error enviando email:", err);
    return NextResponse.json(
      { error: "No se pudo enviar el código. Verificá la configuración de email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
