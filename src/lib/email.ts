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
  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to,
    subject: `${code} — Tu código de acceso Qupón`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 8px;">Qupón</h1>
        <p style="color: #374151; margin-bottom: 24px;">
          Usá este código para ingresar al dashboard de tu local. Expira en 10 minutos.
        </p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #7c3aed;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">
          Si no solicitaste este código, podés ignorar este email.
        </p>
      </div>
    `,
  });
}

export async function sendApprovalRequestEmail(
  ownerEmail: string,
  merchantEmail: string,
  approveUrl: string
) {
  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to: ownerEmail,
    subject: `Solicitud de acceso — ${merchantEmail}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 8px;">Qupón</h1>
        <p style="color: #374151; margin-bottom: 8px;">
          Un nuevo local quiere registrarse en la plataforma:
        </p>
        <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px;">${merchantEmail}</p>
        <p style="color: #374151; margin-bottom: 24px;">
          Hacé clic en el botón para aprobar el acceso. El link expira en 2 horas.
        </p>
        <a href="${approveUrl}"
           style="display: inline-block; background: #7c3aed; color: white;
                  padding: 12px 28px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; font-size: 16px;">
          Aprobar acceso
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Si no reconocés esta solicitud, podés ignorar este email.
        </p>
      </div>
    `,
  });
}

export async function sendLocalOnboardingMagicLink(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/api/auth/local/verify-link?token=${encodeURIComponent(token)}`;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to,
    subject: "Completá tu registro en Qupón",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 8px;">Qupón</h1>
        <p style="color: #374151; margin-bottom: 8px; font-size: 18px; font-weight: 600;">
          ¡Tu acceso fue aprobado!
        </p>
        <p style="color: #374151; margin-bottom: 24px;">
          Hacé clic en el siguiente botón para completar la configuración de tu local.
          Este enlace expira en 2 horas.
        </p>
        <a href="${magicLink}"
           style="display: inline-block; background: #7c3aed; color: white;
                  padding: 12px 28px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; font-size: 16px;">
          Completar mi registro
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Si no solicitaste acceso a Qupón, podés ignorar este email.
        </p>
      </div>
    `,
  });
}

export async function sendMagicLink(
  to: string,
  token: string,
  redirect: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/api/auth/cliente/verify?token=${token}&redirect=${encodeURIComponent(redirect)}`;

  await resendFetch({
    from: process.env.RESEND_FROM || "noreply@qupon.app",
    to,
    subject: "Tu enlace mágico — Qupón",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 8px;">Qupón</h1>
        <p style="color: #374151; margin-bottom: 24px;">
          Haz clic en el siguiente botón para acceder a tus cupones.
          Este enlace expira en 24 horas.
        </p>
        <a href="${magicLink}"
           style="display: inline-block; background: #7c3aed; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600;">
          Ver mis cupones
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Si no solicitaste este enlace, podés ignorar este email.
        </p>
      </div>
    `,
  });
}
