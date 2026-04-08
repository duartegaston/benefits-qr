import { NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { verifyLocalOtpFlow } from "@/server/services/authApiService";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Cuerpo de la solicitud inválido", 400, "INVALID_BODY");
  }

  const result = await verifyLocalOtpFlow(body as Record<string, unknown>);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  const response = apiSuccess(result.data, result.status);
  return setSessionCookie(response, result.sessionToken, result.userType);
}
