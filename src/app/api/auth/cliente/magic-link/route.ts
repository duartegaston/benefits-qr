import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";
import { checkRequestLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Rate limit: 1 request per email per 2 minutes
    if (!checkRequestLimit(`magic-link:cliente:${email}`)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Esperá 2 minutos antes de solicitar un nuevo link." },
        { status: 429 }
      );
    }

    let cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) {
      cliente = await prisma.cliente.create({ data: { email } });
    }

    const session = await createSession(cliente.id, "CLIENTE", 1);
    await sendMagicLink(email, session.token, "/mis-beneficios");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[magic-link]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
