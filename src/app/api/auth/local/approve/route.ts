import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApprovalToken } from "@/lib/approvalToken";
import { sendOtpEmail } from "@/lib/email";

function html(title: string, color: string, message: string) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { background: white; border-radius: 16px; padding: 40px 32px; max-width: 440px;
            width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; margin: 0 0 12px; color: ${color}; }
    p { color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${color === "#16a34a" ? "✅" : color === "#d97706" ? "ℹ️" : "❌"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return html("Link inválido", "#dc2626", "Este link de aprobación no es válido.");
  }

  const payload = verifyApprovalToken(token);

  if (!payload) {
    return html("Link inválido", "#dc2626", "Este link de aprobación no es válido o fue alterado.");
  }

  if (payload.exp < Date.now()) {
    return html(
      "Link expirado",
      "#dc2626",
      "Este link de aprobación expiró. El local debe solicitar acceso nuevamente."
    );
  }

  const otp = await prisma.localOtp.findUnique({ where: { email: payload.email } });

  if (!otp) {
    return html(
      "Solicitud no encontrada",
      "#dc2626",
      "No se encontró una solicitud pendiente para este email. El local puede haber solicitado acceso nuevamente."
    );
  }

  if (!otp.pendingApproval) {
    return html(
      "Ya aprobado",
      "#d97706",
      `El acceso para <strong>${payload.email}</strong> ya fue aprobado anteriormente.`
    );
  }

  // Verify token matches the current OTP record (prevents old tokens from re-approving)
  if (payload.exp !== otp.expiresAt.getTime()) {
    return html(
      "Link inválido",
      "#dc2626",
      "Este link ya no es válido. El local puede haber solicitado acceso nuevamente."
    );
  }

  // Approve: mark as not pending, then send OTP to the merchant
  await prisma.localOtp.update({
    where: { email: payload.email },
    data: { pendingApproval: false },
  });

  try {
    await sendOtpEmail(payload.email, otp.code);
  } catch (err) {
    console.error("[approve] Error enviando OTP:", err);
    return html(
      "Error al enviar código",
      "#dc2626",
      "Se aprobó el acceso pero no se pudo enviar el código. Revisá la configuración de email."
    );
  }

  return html(
    "Acceso aprobado",
    "#16a34a",
    `Se envió el código de acceso a <strong>${payload.email}</strong>. El local ya puede ingresar.`
  );
}
