import { apiError, apiSuccess } from "@/lib/apiResponse";
import {
  createAdminSession,
  getAdminCredentials,
  setAdminSessionCookie,
} from "@/lib/adminAuth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Cuerpo de la solicitud inválido", 400, "INVALID_BODY");
  }

  const username = String((body as Record<string, unknown>)?.username ?? "");
  const password = String((body as Record<string, unknown>)?.password ?? "");

  if (!username || !password) {
    return apiError("Usuario y contraseña requeridos", 400, "MISSING_FIELDS");
  }

  const credentials = getAdminCredentials();
  if (!credentials) {
    return apiError(
      "Acceso admin no configurado. Faltan variables de entorno.",
      500,
      "ADMIN_NOT_CONFIGURED"
    );
  }

  if (
    username !== credentials.username ||
    password !== credentials.password
  ) {
    return apiError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
  }

  const token = await createAdminSession(username);
  const response = apiSuccess({ ok: true });
  return setAdminSessionCookie(response, token);
}
