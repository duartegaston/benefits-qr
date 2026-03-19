import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json();

    if (!email && !phone) {
      return NextResponse.json({ error: "Email o teléfono requerido" }, { status: 400 });
    }

    const cliente = email
      ? await prisma.cliente.findUnique({ where: { email } })
      : await prisma.cliente.findUnique({ where: { phone } });

    // Siempre responder igual (no revelar si el contacto existe o no)
    if (cliente) {
      await createAndSendOtp(email ? { email } : { phone });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
