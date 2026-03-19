import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLocalAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { nombre, direccion, telefono } = await req.json();

  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const local = await prisma.local.update({
    where: { id: session!.userId },
    data: {
      nombre: nombre.trim(),
      direccion: direccion?.trim() || null,
      telefono: telefono?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, local });
}
