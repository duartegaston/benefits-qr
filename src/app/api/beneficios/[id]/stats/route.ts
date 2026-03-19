import { NextRequest, NextResponse } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { id } = await params;

  const beneficio = await prisma.beneficio.findFirst({
    where: { id, localId: session!.userId },
    include: {
      reclamos: {
        include: { cliente: { select: { email: true } } },
        orderBy: { fechaReclamo: "desc" },
      },
    },
  });

  if (!beneficio) {
    return NextResponse.json(
      { error: "Beneficio no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...beneficio,
    totalReclamos: beneficio.reclamos.length,
    canjeados: beneficio.reclamos.filter((r: { estado: string }) => r.estado === "CANJEADO").length,
    pendientes: beneficio.reclamos.filter((r: { estado: string }) => r.estado === "PENDIENTE").length,
  });
}
