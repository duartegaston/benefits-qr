import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";
import { checkVerifyAttempts, clearVerifyAttempts } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  // Brute force protection: max 5 attempts per 15 minutes
  if (!checkVerifyAttempts(`verify:local:${normalized}`)) {
    return NextResponse.json(
      { error: "Demasiados intentos fallidos. Solicitá un nuevo código." },
      { status: 429 }
    );
  }

  const otp = await prisma.localOtp.findUnique({ where: { email: normalized } });

  if (!otp) {
    return NextResponse.json({ error: "Código inválido" }, { status: 401 });
  }

  if (otp.pendingApproval) {
    return NextResponse.json(
      { error: "Tu acceso aún no ha sido aprobado." },
      { status: 403 }
    );
  }

  if (otp.expiresAt < new Date()) {
    return NextResponse.json({ error: "El código expiró. Solicitá uno nuevo." }, { status: 401 });
  }

  // Timing-safe comparison to prevent side-channel attacks
  const codeA = Buffer.from(otp.code, "utf8");
  const codeB = Buffer.from(String(code), "utf8");
  const codeMatch = codeA.length === codeB.length && timingSafeEqual(codeA, codeB);

  if (!codeMatch) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  // OTP valid — clean up
  clearVerifyAttempts(`verify:local:${normalized}`);
  await prisma.localOtp.delete({ where: { email: normalized } });

  // Find or create local
  let local = await prisma.local.findUnique({ where: { email: normalized } });
  const isNew = !local;

  if (!local) {
    local = await prisma.local.create({ data: { email: normalized } });
  }

  const session = await createSession(local.id, "LOCAL");

  const redirectTo = isNew || local.nombre === null ? "/onboarding" : "/dashboard";
  const response = NextResponse.json({ redirect: redirectTo });

  setSessionCookie(response, session.token, "LOCAL");

  return response;
}
