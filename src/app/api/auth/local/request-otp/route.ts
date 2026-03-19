import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail, sendApprovalRequestEmail } from "@/lib/email";
import { generateApprovalToken } from "@/lib/approvalToken";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "duartegaston07@gmail.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

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
      console.error("[request-otp] Error enviando email:", err);
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
      console.error("[request-otp] Error enviando email de aprobación:", err);
      return NextResponse.json(
        { error: "No se pudo enviar la solicitud. Verificá la configuración de email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, requiresApproval: true });
  }
}
