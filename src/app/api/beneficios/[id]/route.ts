import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const beneficio = await prisma.beneficio.findUnique({
    where: { id },
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
