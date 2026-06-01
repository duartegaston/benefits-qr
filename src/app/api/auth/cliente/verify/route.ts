import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/acceso?error=invalid", req.url));
  }

  const payload = await verifyToken(token);

  if (!payload || payload.userType !== UserType.CLIENTE) {
    return NextResponse.redirect(new URL("/acceso?error=expired", req.url));
  }

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date() || session.userType !== UserType.CLIENTE) {
    return NextResponse.redirect(new URL("/acceso?error=expired", req.url));
  }

  await prisma.session.delete({ where: { token } });
  const newSession = await createSession(session.userId, UserType.CLIENTE);

  const response = NextResponse.redirect(new URL("/mis-beneficios", req.url));
  setSessionCookie(response, newSession.token, UserType.CLIENTE);

  return response;
}
