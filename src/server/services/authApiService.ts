import { randomInt, timingSafeEqual } from "crypto";
import { createClienteSession, createSession } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { generateApprovalToken, verifyApprovalToken } from "@/lib/approvalToken";
import { EMAIL_REGEX, SESSION_DURATION } from "@/lib/constants";
import { UserType } from "@/lib/enums";
import { sendApprovalRequestEmail, sendLocalOnboardingMagicLink, sendOtpEmail } from "@/lib/email";
import { checkRequestLimit, checkVerifyAttempts, clearVerifyAttempts } from "@/lib/rateLimit";
import {
  createClienteByEmail,
  createLocalByEmail,
  deleteLocalOtpByEmail,
  findClienteByEmail,
  findLocalByEmail,
  findLocalOtpByEmail,
  upsertLocalOtp,
} from "@/server/repositories/authApiRepository";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "duartegaston07@gmail.com";

type ServiceError = {
  ok: false;
  status: number;
  error: string;
  code: string;
};

export async function sendClienteMagicLinkFlow(
  input: { email?: unknown }
): Promise<{ ok: true; status: number; data: { success: true } } | ServiceError> {
  const { email } = input;

  if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
    return { ok: false, status: 400, error: "Email inválido", code: "INVALID_EMAIL" };
  }

  if (!checkRequestLimit(`magic-link:cliente:${email}`)) {
    return {
      ok: false,
      status: 429,
      error: "Demasiados intentos. Esperá 2 minutos antes de solicitar un nuevo link.",
      code: "RATE_LIMITED",
    };
  }

  let cliente = await findClienteByEmail(email);
  if (!cliente) {
    cliente = await createClienteByEmail(email);
  }

  await createClienteSession(cliente.id, email, SESSION_DURATION.CLIENTE_MAGIC_LINK);

  return { ok: true, status: 200, data: { success: true } };
}

export async function requestLocalOtpFlow(
  input: { email?: unknown }
): Promise<{ ok: true; status: number; data: { ok: true; requiresApproval?: true } } | ServiceError> {
  const { email } = input;

  if (!email || typeof email !== "string") {
    return { ok: false, status: 400, error: "Email requerido", code: "EMAIL_REQUIRED" };
  }

  const normalized = email.trim().toLowerCase();

  if (!checkRequestLimit(`otp:local:${normalized}`)) {
    return {
      ok: false,
      status: 429,
      error: "Demasiados intentos. Esperá 2 minutos antes de solicitar un nuevo código.",
      code: "RATE_LIMITED",
    };
  }

  const code = randomInt(100000, 1000000).toString();
  const existingLocal = await findLocalByEmail(normalized);

  if (existingLocal) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await upsertLocalOtp(normalized, code, expiresAt, false);

    try {
      await sendOtpEmail(normalized, code);
    } catch (err) {
      console.error("[request-otp] Error enviando email:", err instanceof Error ? err.message : String(err));
      return {
        ok: false,
        status: 500,
        error: "No se pudo enviar el código. Verificá la configuración de email.",
        code: "EMAIL_SEND_FAILED",
      };
    }

    return { ok: true, status: 200, data: { ok: true } };
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  await upsertLocalOtp(normalized, code, expiresAt, true);

  const token = generateApprovalToken(normalized, expiresAt);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const approveUrl = `${baseUrl}/api/auth/local/approve?token=${encodeURIComponent(token)}`;

  try {
    await sendApprovalRequestEmail(OWNER_EMAIL, normalized, approveUrl);
  } catch (err) {
    console.error("[request-otp] Error enviando email de aprobación:", err instanceof Error ? err.message : String(err));
    return {
      ok: false,
      status: 500,
      error: "No se pudo enviar la solicitud. Verificá la configuración de email.",
      code: "APPROVAL_EMAIL_SEND_FAILED",
    };
  }

  return { ok: true, status: 200, data: { ok: true, requiresApproval: true } };
}

export async function verifyLocalOtpFlow(
  input: { email?: unknown; code?: unknown }
): Promise<
  | { ok: true; status: number; data: { redirect: string }; sessionToken: string; userType: UserType }
  | ServiceError
> {
  const { email, code } = input;

  if (!email || !code) {
    return {
      ok: false,
      status: 400,
      error: "Email y código requeridos",
      code: "INVALID_INPUT",
    };
  }

  const normalized = String(email).trim().toLowerCase();

  if (!checkVerifyAttempts(`verify:local:${normalized}`)) {
    return {
      ok: false,
      status: 429,
      error: "Demasiados intentos fallidos. Solicitá un nuevo código.",
      code: "RATE_LIMITED",
    };
  }

  const otp = await findLocalOtpByEmail(normalized);

  if (!otp) {
    return { ok: false, status: 401, error: "Código inválido", code: "INVALID_CODE" };
  }

  if (otp.pendingApproval) {
    return {
      ok: false,
      status: 403,
      error: "Tu acceso aún no ha sido aprobado.",
      code: "PENDING_APPROVAL",
    };
  }

  if (otp.expiresAt < new Date()) {
    return {
      ok: false,
      status: 401,
      error: "El código expiró. Solicitá uno nuevo.",
      code: "CODE_EXPIRED",
    };
  }

  const codeA = Buffer.from(otp.code, "utf8");
  const codeB = Buffer.from(String(code), "utf8");
  const codeMatch = codeA.length === codeB.length && timingSafeEqual(codeA, codeB);

  if (!codeMatch) {
    return { ok: false, status: 401, error: "Código incorrecto", code: "WRONG_CODE" };
  }

  clearVerifyAttempts(`verify:local:${normalized}`);
  await deleteLocalOtpByEmail(normalized);

  let local = await findLocalByEmail(normalized);
  const isNew = !local;

  if (!local) {
    local = await createLocalByEmail(normalized);
  }

  const session = await createSession(local.id, UserType.LOCAL);

  const redirect = isNew || local.nombre === null ? "/onboarding" : "/dashboard";

  return {
    ok: true,
    status: 200,
    data: { redirect },
    sessionToken: session.token,
    userType: UserType.LOCAL,
  };
}

const SAFE_REDIRECTS = new Set(["/mis-beneficios", "/dashboard", "/login"]);

function getSafeRedirect(value: string | null): string {
  if (value && SAFE_REDIRECTS.has(value)) return value;
  return "/mis-beneficios";
}

export async function verifyClienteMagicLinkFlow(token: string | null, redirect: string | null) {
  if (!token) {
    return { ok: false as const, redirectTo: "/acceso?error=invalid" };
  }

  const payload = await verifyToken(token);

  if (!payload || payload.userType !== UserType.CLIENTE) {
    return { ok: false as const, redirectTo: "/acceso?error=expired" };
  }

  const newSession = await createSession(payload.userId, UserType.CLIENTE);

  return {
    ok: true as const,
    redirectTo: getSafeRedirect(redirect),
    sessionToken: newSession.token,
    userType: UserType.CLIENTE,
  };
}

export async function verifyLocalMagicLinkFlow(token: string | null) {
  if (!token) {
    return { ok: false as const, redirectTo: "/login?error=invalid" };
  }

  const payload = await verifyToken(token);

  if (!payload || payload.userType !== UserType.LOCAL) {
    return { ok: false as const, redirectTo: "/login?error=expired" };
  }

  const newSession = await createSession(payload.userId, UserType.LOCAL);

  return {
    ok: true as const,
    redirectTo: "/onboarding",
    sessionToken: newSession.token,
    userType: UserType.LOCAL,
  };
}

export async function approveLocalAccessFlow(token: string | null) {
  if (!token) {
    return {
      kind: "error" as const,
      title: "Link inválido",
      color: "#dc2626",
      message: "Este link de aprobación no es válido.",
    };
  }

  const payload = verifyApprovalToken(token);

  if (!payload) {
    return {
      kind: "error" as const,
      title: "Link inválido",
      color: "#dc2626",
      message: "Este link de aprobación no es válido o fue alterado.",
    };
  }

  if (payload.exp < Date.now()) {
    return {
      kind: "error" as const,
      title: "Link expirado",
      color: "#dc2626",
      message: "Este link de aprobación expiró. El local debe solicitar acceso nuevamente.",
    };
  }

  const otp = await findLocalOtpByEmail(payload.email);

  if (!otp) {
    return {
      kind: "error" as const,
      title: "Solicitud no encontrada",
      color: "#dc2626",
      message:
        "No se encontró una solicitud pendiente para este email. El local puede haber solicitado acceso nuevamente.",
    };
  }

  if (!otp.pendingApproval) {
    return {
      kind: "warning" as const,
      title: "Ya aprobado",
      color: "#d97706",
      message: `El acceso para <strong>${payload.email}</strong> ya fue aprobado anteriormente.`,
    };
  }

  if (payload.exp !== otp.expiresAt.getTime()) {
    return {
      kind: "error" as const,
      title: "Link inválido",
      color: "#dc2626",
      message: "Este link ya no es válido. El local puede haber solicitado acceso nuevamente.",
    };
  }

  let local = await findLocalByEmail(payload.email);
  if (!local) {
    local = await createLocalByEmail(payload.email);
  }

  const session = await createSession(local.id, UserType.LOCAL, 2);
  await deleteLocalOtpByEmail(payload.email);

  try {
    await sendLocalOnboardingMagicLink(payload.email, session.token);
  } catch (err) {
    console.error("[approve] Error enviando magic link:", err);
    return {
      kind: "error" as const,
      title: "Error al enviar enlace",
      color: "#dc2626",
      message: "Se aprobó el acceso pero no se pudo enviar el email. Revisá la configuración de Resend.",
    };
  }

  return {
    kind: "success" as const,
    title: "Acceso aprobado",
    color: "#16a34a",
    message: `Se envió el enlace de acceso a <strong>${payload.email}</strong>. El local ya puede completar su registro.`,
  };
}
