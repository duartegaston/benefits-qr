const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:36px 32px;">
              <a href="${BASE_URL}" style="text-decoration:none;display:block;margin-bottom:28px;">
                <img src="${BASE_URL}/logo-min.png" alt="Qupón" width="120"
                     style="display:block;height:auto;border:0;" />
              </a>
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} Qupón ·
                <a href="${BASE_URL}" style="color:#9ca3af;">qupon.com.ar</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function resendFetch(payload: object) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${body}`);
  }
}

export async function sendOtpEmail(to: string, code: string) {
  const content = `
    <p style="margin:0 0 8px;color:#374151;font-size:15px;">
      Usá este código para ingresar al dashboard de tu local. Expira en 10 minutos.
    </p>
    <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <span style="font-size:40px;font-weight:700;letter-spacing:8px;color:#7c3aed;">${code}</span>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:12px;">
      Si no solicitaste este código, podés ignorar este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to,
    subject: `${code} — Tu código de acceso Qupón`,
    html: emailLayout(content),
  });
}

export async function sendApprovalRequestEmail(
  ownerEmail: string,
  merchantEmail: string,
  approveUrl: string
) {
  const content = `
    <p style="margin:0 0 8px;color:#374151;font-size:15px;">
      Un nuevo local quiere registrarse en la plataforma:
    </p>
    <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#111827;">
      ${merchantEmail}
    </p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      Hacé clic en el botón para aprobar el acceso. El link expira en 2 horas.
    </p>
    <a href="${approveUrl}"
       style="display:inline-block;background:#7c3aed;color:#ffffff;
              padding:12px 28px;border-radius:8px;text-decoration:none;
              font-weight:600;font-size:16px;">
      Aprobar acceso
    </a>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">
      Si no reconocés esta solicitud, podés ignorar este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to: ownerEmail,
    subject: `Solicitud de acceso — ${merchantEmail}`,
    html: emailLayout(content),
  });
}

export async function sendLocalOnboardingMagicLink(to: string, token: string) {
  const magicLink = `${BASE_URL}/registro?token=${encodeURIComponent(token)}`;

  const content = `
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#111827;">
      ¡Tu acceso fue aprobado!
    </p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      Hacé clic en el siguiente botón para completar la configuración de tu local.
      Este enlace expira en 2 horas.
    </p>
    <a href="${magicLink}"
       style="display:inline-block;background:#7c3aed;color:#ffffff;
              padding:12px 28px;border-radius:8px;text-decoration:none;
              font-weight:600;font-size:16px;">
      Completar mi registro
    </a>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">
      Si no solicitaste acceso a Qupón, podés ignorar este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to,
    subject: "Completá tu registro en Qupón",
    html: emailLayout(content),
  });
}

export async function sendMagicLink(
  to: string,
  token: string,
  redirect: string
) {
  const magicLink = `${BASE_URL}/acceso?token=${token}`;

  const content = `
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      Haz clic en el siguiente botón para acceder a tus cupones.
      Este enlace expira en 24 horas.
    </p>
    <a href="${magicLink}"
       style="display:inline-block;background:#7c3aed;color:#ffffff;
              padding:12px 28px;border-radius:8px;text-decoration:none;
              font-weight:600;font-size:16px;">
      Ver mis cupones
    </a>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">
      Si no solicitaste este enlace, podés ignorar este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to,
    subject: "Tu enlace mágico — Qupón",
    html: emailLayout(content),
  });
}
