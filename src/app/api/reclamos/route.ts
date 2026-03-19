import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { beneficioId, email, phone, nombre } = await req.json();

    if (!beneficioId || (!email && !phone)) {
      return NextResponse.json(
        { error: "Beneficio y email o teléfono son requeridos" },
        { status: 400 }
      );
    }

    const beneficio = await prisma.beneficio.findUnique({
      where: { id: beneficioId },
      include: { reclamos: { where: { estado: "CANJEADO" }, select: { id: true } } },
    });

    if (!beneficio) {
      return NextResponse.json({ error: "Beneficio no encontrado" }, { status: 404 });
    }

    if (beneficio.fechaExpiracion < new Date()) {
      return NextResponse.json({ error: "Este beneficio ya expiró" }, { status: 400 });
    }

    if (beneficio.diasValidos.length > 0) {
      const hoy = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
      ).getDay();
      if (!beneficio.diasValidos.includes(hoy)) {
        const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const nombres = beneficio.diasValidos
          .sort((a: number, b: number) => a - b)
          .map((d: number) => DIAS[d])
          .join(", ");
        return NextResponse.json(
          { error: `Este beneficio solo aplica los: ${nombres}` },
          { status: 400 }
        );
      }
    }

    if (beneficio.maxUsos !== null && beneficio.reclamos.length >= beneficio.maxUsos) {
      return NextResponse.json(
        { error: "Este beneficio ya alcanzó el máximo de usos" },
        { status: 400 }
      );
    }

    let cliente;
    if (email) {
      cliente = await prisma.cliente.findUnique({ where: { email } });
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { email } });
      }
    } else {
      if (!nombre) {
        return NextResponse.json(
          { error: "El nombre es requerido para registrarse con WhatsApp" },
          { status: 400 }
        );
      }
      cliente = await prisma.cliente.findUnique({ where: { phone } });
      if (!cliente) {
        cliente = await prisma.cliente.create({ data: { phone, nombre } });
      }
    }

    const existingReclamo = await prisma.reclamo.findFirst({
      where: { beneficioId, clienteId: cliente.id },
    });

    if (existingReclamo) {
      if (existingReclamo.estado === "CANJEADO") {
        return NextResponse.json({ error: "Ya canjeaste este beneficio" }, { status: 409 });
      }
      // Reclamo existente pero no canjeado → reenviar código
      await createAndSendOtp(email ? { email } : { phone });
      return NextResponse.json({ success: true, reclamoId: existingReclamo.id });
    }

    const reclamo = await prisma.reclamo.create({
      data: { beneficioId, clienteId: cliente.id },
    });

    await createAndSendOtp(email ? { email } : { phone });

    return NextResponse.json({ success: true, reclamoId: reclamo.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
