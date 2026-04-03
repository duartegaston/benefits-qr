import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClienteSession } from "@/lib/auth";
import { checkRequestLimit } from "@/lib/rateLimit";
import { EMAIL_REGEX, SESSION_DURATION } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

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

    await createClienteSession(cliente.id, email, SESSION_DURATION.CLIENTE_MAGIC_LINK);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[magic-link]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
