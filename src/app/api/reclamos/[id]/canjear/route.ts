import { NextRequest, NextResponse } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EstadoReclamo } from "@/generated/prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { id } = await params;
  const { qrToken } = await req.json();

  if (!qrToken) {
    return NextResponse.json(
      { error: "Token QR requerido" },
      { status: 400 }
    );
  }

  const reclamo = await prisma.reclamo.findFirst({
    where: { id, qrToken },
    include: { beneficio: true },
  });

  if (!reclamo) {
    return NextResponse.json({ error: "QR inválido" }, { status: 400 });
  }

  if (reclamo.beneficio.localId !== session!.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!reclamo.qrTokenExpira || reclamo.qrTokenExpira < new Date()) {
    return NextResponse.json({ error: "QR expirado" }, { status: 400 });
  }

  if (reclamo.beneficio.deletedAt !== null) {
    return NextResponse.json(
      { error: "Este beneficio ya no está disponible" },
      { status: 400 }
    );
  }

  if (reclamo.estado === EstadoReclamo.CANCELADO) {
    return NextResponse.json(
      { error: "Este cupón ha sido eliminado por el local" },
      { status: 409 }
    );
  }

  if (reclamo.estado === EstadoReclamo.CANJEADO) {
    return NextResponse.json(
      { error: "Este cupón ya fue canjeado" },
      { status: 400 }
    );
  }

  await prisma.reclamo.update({
    where: { id },
    data: { estado: EstadoReclamo.CANJEADO, fechaCanje: new Date(), qrToken: null },
  });

  return NextResponse.json({ success: true });
}
