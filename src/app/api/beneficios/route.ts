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
      reclamos: { select: { estado: true } },
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
    canjeados: b.reclamos.filter((r: { estado: string }) => r.estado === "CANJEADO").length,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { descripcion, fechaExpiracion, maxUsos } = await req.json();

  if (!descripcion || !fechaExpiracion) {
    return NextResponse.json(
      { error: "Descripción y fecha de expiración son requeridas" },
      { status: 400 }
    );
  }

  const beneficio = await prisma.beneficio.create({
    data: {
      descripcion,
      fechaExpiracion: new Date(fechaExpiracion),
      maxUsos: maxUsos || null,
      localId: session!.userId,
    },
  });

  return NextResponse.json(beneficio, { status: 201 });
}
