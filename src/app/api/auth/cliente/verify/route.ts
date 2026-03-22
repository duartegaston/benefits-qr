import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

// Whitelist of allowed post-login destinations
const SAFE_REDIRECTS = new Set(["/mis-beneficios", "/dashboard", "/login"]);

function getSafeRedirect(value: string | null): string {
  if (value && SAFE_REDIRECTS.has(value)) return value;
  return "/mis-beneficios";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const safeRedirect = getSafeRedirect(searchParams.get("redirect"));

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

  // Rotate token to make the magic link single-use.
  // The old session (URL token) is deleted and a new one is created for the cookie.
  const newSession = await createSession(session.userId, "CLIENTE");
  await prisma.session.delete({ where: { token } });

  const response = NextResponse.redirect(new URL(safeRedirect, req.url));
  return setSessionCookie(response, newSession.token, "CLIENTE");
}
