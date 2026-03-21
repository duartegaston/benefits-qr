import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const session = await prisma.session.findUnique({ where: { token } });

  if (
    !session ||
    session.expiresAt < new Date() ||
    session.userType !== "LOCAL"
  ) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  // Rotar token (single-use)
  await prisma.session.delete({ where: { token } });
  const newSession = await createSession(session.userId, "LOCAL");

  const response = NextResponse.redirect(new URL("/onboarding", req.url));
  return setSessionCookie(response, newSession.token, "LOCAL");
}
