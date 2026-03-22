import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLocalAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const beneficio = await prisma.beneficio.findUnique({
    where: { id, deletedAt: null },
    include: { local: { select: { nombre: true, logoUrl: true } } },
  });

  if (!beneficio) {
    return NextResponse.json(
      { error: "Beneficio no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(beneficio);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { id } = await params;

  const beneficio = await prisma.beneficio.findFirst({
    where: { id, localId: session!.userId, deletedAt: null },
  });

  if (!beneficio) {
    return NextResponse.json(
      { error: "Cupón no encontrado" },
      { status: 404 }
    );
  }

  await prisma.beneficio.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
