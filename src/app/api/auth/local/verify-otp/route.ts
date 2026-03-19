import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const otp = await prisma.localOtp.findUnique({ where: { email: normalized } });

  if (!otp) {
    return NextResponse.json({ error: "Código inválido" }, { status: 401 });
  }

  if (otp.code !== code) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  if (otp.expiresAt < new Date()) {
    return NextResponse.json({ error: "El código expiró. Solicitá uno nuevo." }, { status: 401 });
  }

  // OTP valid — delete it
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

  setSessionCookie(response, session.token);

  return response;
}
