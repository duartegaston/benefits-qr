import { NextRequest, NextResponse } from "next/server";
import { getClienteSession, setSessionCookie } from "@/lib/auth";
import { apiError } from "@/lib/apiResponse";
import { UserType } from "@/lib/enums";
import { DIRECT_QR_FLOW } from "@/lib/flows";
import {
  createAnonymousReclamoFlow,
  getAnonymousNombreRequirement,
  redeemAnonymousDirectFlow,
} from "@/server/services/reclamosService";

export async function GET(req: NextRequest) {
  try {
    const existingSession = await getClienteSession(req);
    const existingClienteId = existingSession?.userId ?? null;

    const beneficioId = req.nextUrl.searchParams.get("beneficioId");
    const result = await getAnonymousNombreRequirement(beneficioId, existingClienteId);

    if (!result.ok) {
      return apiError(result.error, result.status, result.code);
    }

    return NextResponse.json({ requiresNombre: result.requiresNombre }, { status: 200 });
  } catch (error) {
    console.error("[reclamos/anonimo][GET]", error instanceof Error ? error.message : String(error));
    return apiError("Error del servidor", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const existingSession = await getClienteSession(req);
    const existingClienteId = existingSession?.userId ?? null;

    const body = await req.json();
    const isDirectFlow = body?.flow === DIRECT_QR_FLOW;
    if (isDirectFlow) {
      const result = await redeemAnonymousDirectFlow(
        body.beneficioId,
        existingClienteId,
        body.nombre
      );

      if (!result.ok) {
        return apiError(result.error, result.status, result.code);
      }

      const response = NextResponse.json(
        {
          success: true,
          reclamoId: result.reclamoId,
          orderNumber: result.orderNumber,
          alreadyRedeemed: result.alreadyRedeemed,
        },
        { status: result.status }
      );

      if (result.sessionToken) {
        setSessionCookie(response, result.sessionToken, UserType.CLIENTE);
      }

      return response;
    }

    const result = await createAnonymousReclamoFlow(
      body.beneficioId,
      existingClienteId,
      body.nombre
    );

    if (!result.ok) {
      return apiError(result.error, result.status, result.code);
    }

    const response = NextResponse.json({ reclamoId: result.reclamoId }, { status: result.status });

    if (result.sessionToken) {
      setSessionCookie(response, result.sessionToken, UserType.CLIENTE);
    }

    return response;
  } catch (error) {
    console.error("[reclamos/anonimo]", error instanceof Error ? error.message : String(error));
    return apiError("Error del servidor", 500, "INTERNAL_ERROR");
  }
}
