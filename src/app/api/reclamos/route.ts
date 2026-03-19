import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { beneficioId, email } = await req.json();

    if (!beneficioId || !email) {
      return NextResponse.json(
        { error: "Beneficio y email son requeridos" },
        { status: 400 }
      );
    }

    const beneficio = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
      include: { reclamos: { where: { estado: "CANJEADO" }, select: { id: true } } },
    });

    if (!beneficio) {
      return NextResponse.json(
        { error: "Beneficio no encontrado" },
        { status: 404 }
      );
    }

    if (beneficio.fechaExpiracion < new Date()) {
      return NextResponse.json(
        { error: "Este beneficio ya expiró" },
        { status: 400 }
      );
    }

    if (
      beneficio.maxUsos !== null &&
      beneficio.reclamos.length >= beneficio.maxUsos
    ) {
      return NextResponse.json(
        { error: "Este beneficio ya alcanzó el máximo de usos" },
        { status: 400 }
      );
    }

    let cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) {
      cliente = await prisma.cliente.create({ data: { email } });
    }

    const existingReclamo = await prisma.reclamo.findFirst({
      where: { beneficioId, clienteId: cliente.id },
    });

    if (existingReclamo) {
      if (existingReclamo.estado === "CANJEADO") {
        return NextResponse.json(
          { error: "Ya canjeaste este beneficio" },
          { status: 409 }
        );
      }
      // Reclamo existente pero no canjeado → reenviar magic link
      const session = await createSession(cliente.id, "CLIENTE", 24);
      await sendMagicLink(email, session.token, "/mis-beneficios");
      return NextResponse.json(
        { success: true, reclamoId: existingReclamo.id },
        { status: 200 }
      );
    }

    const reclamo = await prisma.reclamo.create({
      data: { beneficioId, clienteId: cliente.id },
    });

    const session = await createSession(cliente.id, "CLIENTE", 24);
    await sendMagicLink(email, session.token, "/mis-beneficios");

    return NextResponse.json(
      { success: true, reclamoId: reclamo.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
