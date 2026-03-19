import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, nombre } = await req.json();

    if (!email && !phone) {
      return NextResponse.json({ error: "Email o teléfono requerido" }, { status: 400 });
    }

    let cliente;
    if (email) {
      cliente = await prisma.cliente.findUnique({ where: { email } });
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { email } });
      }
    } else {
      cliente = await prisma.cliente.findUnique({ where: { phone } });
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { phone, nombre } });
      }
    }

    await createAndSendOtp(email ? { email } : { phone });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
