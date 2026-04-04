import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { createReclamoFlow } from "@/server/services/reclamosService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createReclamoFlow(body);

    if (!result.ok) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess({ success: true, reclamoId: result.reclamoId }, result.status);
  } catch (error) {
    console.error("[reclamos]", error instanceof Error ? error.message : String(error));
    return apiError("Error del servidor", 500, "INTERNAL_ERROR");
  }
}
