import { NextRequest, NextResponse } from "next/server";
import { getClienteSession, setSessionCookie } from "@/lib/auth";
import { apiError } from "@/lib/apiResponse";
import { UserType } from "@/lib/enums";
import { createAnonymousReclamoFlow } from "@/server/services/reclamosService";

export async function POST(req: NextRequest) {
  try {
    const existingSession = await getClienteSession(req);
    const existingClienteId = existingSession?.userId ?? null;

    const body = await req.json();
    const result = await createAnonymousReclamoFlow(body.beneficioId, existingClienteId);

    if (!result.ok) {
      return apiError(result.error, result.status, result.code);
    }

    const response = NextResponse.json(
      { reclamoId: result.reclamoId },
      { status: result.status }
    );

    if (result.sessionToken) {
      setSessionCookie(response, result.sessionToken, UserType.CLIENTE);
    }

    return response;
  } catch (error) {
    console.error("[reclamos/anonimo]", error instanceof Error ? error.message : String(error));
    return apiError("Error del servidor", 500, "INTERNAL_ERROR");
  }
}
