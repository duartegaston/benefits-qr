import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect") || "/mis-beneficios";

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const session = await prisma.session.findUnique({ where: { token } });

  if (
    !session ||
    session.expiresAt < new Date() ||
    session.userType !== "CLIENTE"
  ) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  const response = NextResponse.redirect(new URL(redirect, req.url));
  return setSessionCookie(response, token, "CLIENTE");
}
