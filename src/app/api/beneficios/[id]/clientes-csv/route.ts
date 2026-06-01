import { NextRequest, NextResponse } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { id } = await params;

  const beneficio = await prisma.beneficio.findFirst({
    where: { id, localId: session!.userId },
    select: { descripcion: true },
  });

  if (!beneficio) {
    return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
  }

  const reclamos = await prisma.reclamo.findMany({
    where: { beneficioId: id },
    select: { cliente: { select: { nombre: true, email: true } } },
    orderBy: { fechaReclamo: "desc" },
  });

  const header = "Nombre,Email";
  const rows = reclamos.map(({ cliente }) =>
    [
      escapeCsvField(cliente.nombre ?? ""),
      escapeCsvField(cliente.email ?? ""),
    ].join(",")
  );

  const csv = [header, ...rows].join("\r\n");
  const filename = `clientes-${id}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}