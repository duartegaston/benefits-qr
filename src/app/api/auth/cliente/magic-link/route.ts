import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";
import { sendMagicLinkWhatsapp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, nombre, redirect } = await req.json();

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

    const session = await createSession(cliente.id, "CLIENTE", 24);
    const dest = redirect || "/mis-beneficios";
    if (cliente.email) {
      await sendMagicLink(cliente.email, session.token, dest);
    } else {
      await sendMagicLinkWhatsapp(cliente.phone!, session.token, dest);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
