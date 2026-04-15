const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;
const EMAIL_PRIMARY_BG = "#5f3add";
const EMAIL_PRIMARY_TEXT = "#ffffff";
const EMAIL_PAGE_BG = "#f3f4f6";
const EMAIL_CARD_BG = "#ffffff";
const EMAIL_TEXT_PRIMARY = "#18181b";
const EMAIL_TEXT_SECONDARY = "#374151";
const EMAIL_TEXT_MUTED = "#52525b";
const EMAIL_TEXT_SOFT = "#9ca3af";
const EMAIL_CODE_BG = "#f4f4f5";

function primaryButton(href: string, label: string, padding = "12px 28px"): string {
  return `
    <a href="${href}"
       style="display:inline-block;background:${EMAIL_PRIMARY_BG};border-radius:8px;padding:${padding};text-decoration:none;">
      <span style="color:${EMAIL_PRIMARY_TEXT} !important;font-weight:600;font-size:16px;line-height:1.2;text-decoration:none;display:inline-block;">
        ${label}
      </span>
    </a>
  `;
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_PAGE_BG};font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_PAGE_BG};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Card -->
          <tr>
            <td style="background-color:${EMAIL_CARD_BG};border-radius:12px;padding:36px 32px;">
              <a href="${BASE_URL}" style="text-decoration:none;display:block;margin-bottom:28px;">
                <img src="${BASE_URL}/logo.png" alt="Qupón" width="100"
                     style="display:block;height:auto;border:0;" />
              </a>
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:${EMAIL_TEXT_SOFT};font-size:12px;">
                © ${new Date().getFullYear()} Qupón ·
                <a href="${BASE_URL}" style="color:${EMAIL_TEXT_SOFT};">qupon.com.ar</a>
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
    <h2 style="margin:0 0 8px;font-size:20px;color:${EMAIL_TEXT_PRIMARY};">
      Tu código de acceso
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${EMAIL_TEXT_MUTED};line-height:1.6;">
      Usá este código para ingresar al dashboard de tu local en Qupon.
      El código es válido por 10 minutos y puede usarse una sola vez.
    </p>
    <div style="background:${EMAIL_CODE_BG};border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:${EMAIL_TEXT_PRIMARY};">
        ${code}
      </span>
    </div>
    <p style="margin:0 0 12px;font-size:14px;color:${EMAIL_TEXT_MUTED};line-height:1.6;">
      Si no solicitaste este código, alguien puede estar intentando acceder a tu cuenta.
      Podés ignorar este mail con seguridad — tu cuenta no será afectada.
    </p>
    <p style="margin:0;font-size:13px;color:${EMAIL_TEXT_SOFT};">
      Este es un mensaje automático, no respondas este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@godevs.com.ar",
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
    <p style="margin:0 0 8px;color:${EMAIL_TEXT_SECONDARY};font-size:15px;">
      Un nuevo local quiere registrarse en la plataforma:
    </p>
    <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:${EMAIL_TEXT_PRIMARY};">
      ${merchantEmail}
    </p>
    <p style="margin:0 0 24px;color:${EMAIL_TEXT_SECONDARY};font-size:15px;">
      Hacé clic en el botón para aprobar el acceso. El link expira en 2 horas.
    </p>
    ${primaryButton(approveUrl, "Aprobar acceso")}
    <p style="margin:24px 0 0;color:${EMAIL_TEXT_SOFT};font-size:12px;">
      Si no reconocés esta solicitud, podés ignorar este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@godevs.com.ar",
    to: ownerEmail,
    subject: `Solicitud de acceso — ${merchantEmail}`,
    html: emailLayout(content),
  });
}

export async function sendLocalOnboardingMagicLink(to: string, token: string) {
  const magicLink = `${BASE_URL}/registro?token=${encodeURIComponent(token)}`;

  const content = `
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:${EMAIL_TEXT_PRIMARY};">
      ¡Tu acceso fue aprobado!
    </p>
    <p style="margin:0 0 24px;color:${EMAIL_TEXT_SECONDARY};font-size:15px;">
      Hacé clic en el siguiente botón para completar la configuración de tu local.
      Este enlace expira en 2 horas.
    </p>
    ${primaryButton(magicLink, "Completar mi registro")}
    <p style="margin:24px 0 0;color:${EMAIL_TEXT_SOFT};font-size:12px;">
      Si no solicitaste acceso a Qupón, podés ignorar este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@godevs.com.ar",
    to,
    subject: "Completá tu registro en Qupón",
    html: emailLayout(content),
  });
}

export async function sendMagicLink(
  to: string,
  token: string
) {
  const magicLink = `${BASE_URL}/acceso?token=${token}`;

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:${EMAIL_TEXT_PRIMARY};">
      Tu enlace de acceso
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${EMAIL_TEXT_MUTED};line-height:1.6;">
      Hacé clic en el botón para acceder a tus cupones en Qupon.
      El enlace es válido por 24 horas y puede usarse una sola vez.
    </p>
    ${primaryButton(magicLink, "Ver mis cupones", "14px 28px")}
    <p style="margin:24px 0 12px;font-size:14px;color:${EMAIL_TEXT_MUTED};line-height:1.6;">
      Si no solicitaste este enlace, alguien puede haber ingresado tu email por error.
      Podés ignorar este mail con seguridad — tu cuenta no será afectada.
    </p>
    <p style="margin:0;font-size:13px;color:${EMAIL_TEXT_SOFT};">
      Este es un mensaje automático, no respondas este email.
    </p>
  `;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@godevs.com.ar",
    to,
    subject: "Tu enlace mágico — Qupón",
    html: emailLayout(content),
  });
}
