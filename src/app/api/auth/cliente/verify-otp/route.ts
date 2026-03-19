import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, code } = await req.json();

    if ((!email && !phone) || !code) {
      return NextResponse.json({ error: "Contacto y código requeridos" }, { status: 400 });
    }

    const otp = email
      ? await prisma.clienteOtp.findUnique({ where: { email } })
      : await prisma.clienteOtp.findUnique({ where: { phone } });

    if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
    }

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
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
