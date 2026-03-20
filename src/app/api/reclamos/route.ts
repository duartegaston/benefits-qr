import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp } from "@/lib/otp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export async function POST(req: NextRequest) {
  try {
    const { beneficioId, nombre, email, phone, channel } = await req.json();

    if (!beneficioId || !nombre || !email || !phone || !channel) {
      return NextResponse.json(
        { error: "Nombre, email y WhatsApp son requeridos" },
        { status: 400 }
      );
    }

    if (channel !== "email" && channel !== "whatsapp") {
      return NextResponse.json({ error: "Canal inválido" }, { status: 400 });
    }

    // Input validation
    if (typeof nombre !== "string" || nombre.trim().length === 0 || nombre.length > 100) {
      return NextResponse.json({ error: "Nombre inválido (máx. 100 caracteres)" }, { status: 400 });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    if (typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
      return NextResponse.json({ error: "Número de teléfono inválido" }, { status: 400 });
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

    // Deduplication: look up by email and by phone separately
    const [clienteByEmail, clienteByPhone] = await Promise.all([
      prisma.cliente.findUnique({ where: { email } }),
      prisma.cliente.findUnique({ where: { phone } }),
    ]);

    // Cross-conflict: email already registered with a different phone
    if (clienteByEmail && clienteByEmail.phone && clienteByEmail.phone !== phone) {
      return NextResponse.json(
        { error: "Este email ya está registrado con otro número de WhatsApp" },
        { status: 400 }
      );
    }

    // Cross-conflict: phone already registered with a different email
    if (clienteByPhone && clienteByPhone.email && clienteByPhone.email !== email) {
      return NextResponse.json(
        { error: "Este número de WhatsApp ya está registrado con otro email" },
        { status: 400 }
      );
    }

    // Split-identity: email and phone exist but in separate records → would cause P2002 on update
    if (clienteByEmail && clienteByPhone && clienteByEmail.id !== clienteByPhone.id) {
      return NextResponse.json(
        { error: "El email y el WhatsApp ya están registrados en cuentas separadas. Contactate con el negocio." },
        { status: 400 }
      );
    }

    // Use existing record or create a new unified one
    let cliente = clienteByEmail ?? clienteByPhone;
    if (!cliente) {
      cliente = await prisma.cliente.create({ data: { nombre, email, phone } });
    } else {
      // Update missing fields if any
      const updates: Record<string, string> = {};
      if (!cliente.nombre) updates.nombre = nombre;
      if (!cliente.email) updates.email = email;
      if (!cliente.phone) updates.phone = phone;
      if (Object.keys(updates).length > 0) {
        cliente = await prisma.cliente.update({ where: { id: cliente.id }, data: updates });
      }
    }

    const existingReclamo = await prisma.reclamo.findFirst({
      where: { beneficioId, clienteId: cliente.id },
    });

    if (existingReclamo) {
      if (existingReclamo.estado === "CANJEADO") {
        return NextResponse.json({ error: "Ya canjeaste este beneficio" }, { status: 409 });
      }
      // Reclamo exists but not redeemed → resend OTP
      await createAndSendOtp(channel === "email" ? { email } : { phone });
      return NextResponse.json({ success: true, reclamoId: existingReclamo.id });
    }

    const reclamo = await prisma.reclamo.create({
      data: { beneficioId, clienteId: cliente.id },
    });

    await createAndSendOtp(channel === "email" ? { email } : { phone });

    return NextResponse.json({ success: true, reclamoId: reclamo.id }, { status: 201 });
  } catch (error) {
    console.error("[reclamos]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
