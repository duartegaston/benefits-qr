import { NextRequest, NextResponse } from "next/server";
import { requireClienteAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { error, session } = await requireClienteAuth(req);
  if (error) return error;

  const reclamos = await prisma.reclamo.findMany({
    where: { clienteId: session!.userId },
    include: {
      beneficio: {
        include: { local: { select: { nombre: true, logoUrl: true } } },
      },
    },
    orderBy: { fechaReclamo: "desc" },
  });

  return NextResponse.json(reclamos);
}
