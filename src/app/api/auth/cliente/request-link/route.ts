import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json();

    if (!email && !phone) {
      return NextResponse.json({ error: "Email o teléfono requerido" }, { status: 400 });
    }

    let cliente;
    if (email) {
      cliente = await prisma.cliente.findUnique({ where: { email } });
    } else {
      cliente = await prisma.cliente.findUnique({ where: { phone } });
    }

    // Siempre responder igual (no revelar si el contacto existe o no)
    if (cliente) {
      if (cliente.email) {
        const session = await createSession(cliente.id, "CLIENTE", 24);
        await sendMagicLink(cliente.email, session.token, "/mis-beneficios");
      } else {
        await createAndSendOtp(cliente.phone!);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
