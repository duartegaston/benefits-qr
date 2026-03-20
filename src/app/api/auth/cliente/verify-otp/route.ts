import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";
import { checkVerifyAttempts, clearVerifyAttempts } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, code } = await req.json();

    if ((!email && !phone) || !code) {
      return NextResponse.json({ error: "Contacto y código requeridos" }, { status: 400 });
    }

    const key = email ?? phone;

    // Brute force protection: max 5 attempts per 15 minutes
    if (!checkVerifyAttempts(`verify:cliente:${key}`)) {
      return NextResponse.json(
        { error: "Demasiados intentos fallidos. Solicitá un nuevo código." },
        { status: 429 }
      );
    }

    const otp = email
      ? await prisma.clienteOtp.findUnique({ where: { email } })
      : await prisma.clienteOtp.findUnique({ where: { phone } });

    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
    }

    // Timing-safe comparison to prevent side-channel attacks
    const codeA = Buffer.from(otp.code, "utf8");
    const codeB = Buffer.from(String(code), "utf8");
    const codeMatch = codeA.length === codeB.length && timingSafeEqual(codeA, codeB);

    if (!codeMatch) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
    }

    // OTP valid — clean up
    clearVerifyAttempts(`verify:cliente:${key}`);
    if (email) {
      await prisma.clienteOtp.delete({ where: { email } });
    } else {
      await prisma.clienteOtp.delete({ where: { phone } });
    }

    const cliente = email
      ? await prisma.cliente.findUnique({ where: { email } })
      : await prisma.cliente.findUnique({ where: { phone } });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const session = await createSession(cliente.id, "CLIENTE", 24 * 7);
    const response = NextResponse.json({ success: true, redirect: "/mis-beneficios" });
    return setSessionCookie(response, session.token, "CLIENTE");
  } catch (error) {
    console.error("[verify-otp]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
