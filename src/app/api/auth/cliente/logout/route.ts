import { NextRequest, NextResponse } from "next/server";
import { getClienteSession, clearClienteSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getClienteSession(req);
  if (session) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
  }
  const response = NextResponse.json({ success: true });
  return clearClienteSessionCookie(response);
}
