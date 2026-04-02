import { NextRequest, NextResponse } from "next/server";
import { requireClienteAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRDataURL, buildQRPayload } from "@/lib/qr";
import { EstadoReclamo } from "@/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireClienteAuth(req);
  if (error) return error;

  const { id } = await params;

  const reclamo = await prisma.reclamo.findFirst({
    where: { id, clienteId: session!.userId },
  });

  if (!reclamo) {
    return NextResponse.json(
      { error: "Reclamo no encontrado" },
      { status: 404 }
    );
  }

  if (reclamo.estado === EstadoReclamo.CANJEADO) {
    return NextResponse.json(
      { error: "Este cupón ya fue canjeado" },
      { status: 400 }
    );
  }

  if (reclamo.estado === EstadoReclamo.CANCELADO) {
    return NextResponse.json(
      { error: "Este cupón ha sido eliminado por el local" },
      { status: 409 }
    );
  }

  const qrToken = uuidv4();
  const qrTokenExpira = new Date(Date.now() + 2 * 60 * 1000);

  await prisma.reclamo.update({
    where: { id },
    data: { qrToken, qrTokenExpira },
  });

  const payload = buildQRPayload(id, qrToken);
  const qrDataURL = await generateQRDataURL(payload);

  return NextResponse.json({ qrDataURL, expiresAt: qrTokenExpira });
}
