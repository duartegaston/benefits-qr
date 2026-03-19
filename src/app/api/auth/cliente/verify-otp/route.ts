import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Teléfono y código requeridos" }, { status: 400 });
    }

    const otp = await prisma.clienteOtp.findUnique({ where: { phone } });

    if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
    }

    await prisma.clienteOtp.delete({ where: { phone } });

    const cliente = await prisma.cliente.findUnique({ where: { phone } });
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
