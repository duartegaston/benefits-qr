import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, redirect } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    let cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) {
      cliente = await prisma.cliente.create({ data: { email } });
    }

    const session = await createSession(cliente.id, "CLIENTE", 24);
    await sendMagicLink(email, session.token, redirect || "/mis-beneficios");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
