import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail, sendApprovalRequestEmail } from "@/lib/email";
import { generateApprovalToken } from "@/lib/approvalToken";
import { checkRequestLimit } from "@/lib/rateLimit";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "duartegaston07@gmail.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  // Rate limit: 1 request per email per 2 minutes
  if (!checkRequestLimit(`otp:local:${normalized}`)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá 2 minutos antes de solicitar un nuevo código." },
      { status: 429 }
    );
  }

  const code = randomInt(100000, 1000000).toString();

  const existingLocal = await prisma.local.findUnique({ where: { email: normalized } });

  if (existingLocal) {
    // Known local — send OTP directly, no approval needed
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.localOtp.upsert({
      where: { email: normalized },
      update: { code, expiresAt, pendingApproval: false },
      create: { email: normalized, code, expiresAt, pendingApproval: false },
    });

    try {
      await sendOtpEmail(normalized, code);
    } catch (err) {
      console.error("[request-otp] Error enviando email:", err instanceof Error ? err.message : String(err));
      return NextResponse.json(
        { error: "No se pudo enviar el código. Verificá la configuración de email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } else {
    // New local — requires owner approval before OTP is sent
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await prisma.localOtp.upsert({
      where: { email: normalized },
      update: { code, expiresAt, pendingApproval: true },
      create: { email: normalized, code, expiresAt, pendingApproval: true },
    });

    const token = generateApprovalToken(normalized, expiresAt);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const approveUrl = `${baseUrl}/api/auth/local/approve?token=${encodeURIComponent(token)}`;

    try {
      await sendApprovalRequestEmail(OWNER_EMAIL, normalized, approveUrl);
    } catch (err) {
      console.error("[request-otp] Error enviando email de aprobación:", err instanceof Error ? err.message : String(err));
      return NextResponse.json(
        { error: "No se pudo enviar la solicitud. Verificá la configuración de email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, requiresApproval: true });
  }
}
