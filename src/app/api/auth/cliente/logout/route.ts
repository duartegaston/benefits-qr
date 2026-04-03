import { NextRequest, NextResponse } from "next/server";
import { getClienteSession, clearClienteSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getClienteSession(req);
  const token = req.cookies.get("cliente_session")?.value;
  if (session && token) {
    // Usar el token de la cookie para encontrar y eliminar la sesión
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  const response = NextResponse.json({ success: true });
  return clearClienteSessionCookie(response);
}
