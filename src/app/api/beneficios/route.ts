import { NextRequest, NextResponse } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const beneficios = await prisma.beneficio.findMany({
    where: { localId: session!.userId },
    include: {
      _count: { select: { reclamos: true } },
      reclamos: { where: { estado: "CANJEADO" }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = beneficios.map((b) => ({
    id: b.id,
    descripcion: b.descripcion,
    fechaExpiracion: b.fechaExpiracion,
    maxUsos: b.maxUsos,
    createdAt: b.createdAt,
    totalReclamos: b._count.reclamos,
    canjeados: b.reclamos.length,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { descripcion, fechaExpiracion, maxUsos, diasValidos } = await req.json();

  // Input validation
  if (typeof descripcion !== "string" || descripcion.trim().length === 0 || descripcion.length > 500) {
    return NextResponse.json(
      { error: "Descripción inválida (máx. 500 caracteres)" },
      { status: 400 }
    );
  }

  if (!fechaExpiracion) {
    return NextResponse.json({ error: "Fecha de expiración requerida" }, { status: 400 });
  }

  const expiryDate = new Date(fechaExpiracion);
  if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
    return NextResponse.json(
      { error: "Fecha de expiración inválida (debe ser futura)" },
      { status: 400 }
    );
  }

  if (maxUsos !== undefined && maxUsos !== null) {
    if (typeof maxUsos !== "number" || !Number.isInteger(maxUsos) || maxUsos < 1) {
      return NextResponse.json(
        { error: "La cantidad máxima de usos debe ser un número entero positivo" },
        { status: 400 }
      );
    }
  }

  const dias: number[] = Array.isArray(diasValidos)
    ? diasValidos.filter((d: unknown) => typeof d === "number" && d >= 0 && d <= 6)
    : [];

  const beneficio = await prisma.beneficio.create({
    data: {
      descripcion: descripcion.trim(),
      fechaExpiracion: expiryDate,
      maxUsos: maxUsos || null,
      diasValidos: dias,
      localId: session!.userId,
    },
  });

  return NextResponse.json(beneficio, { status: 201 });
}
