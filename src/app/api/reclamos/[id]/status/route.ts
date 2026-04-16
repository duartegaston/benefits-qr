import { NextRequest } from "next/server";
import { requireClienteAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getMisBeneficioStatusData } from "@/server/services/misBeneficiosService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireClienteAuth(req);
  if (error) return error;

  const { id } = await params;
  const reclamo = await getMisBeneficioStatusData(session!.userId, id);

  if (!reclamo) {
    return apiError("Reclamo no encontrado", 404, "RECLAMO_NOT_FOUND");
  }

  return apiSuccess({
    effectiveStatus: reclamo.effectiveStatus,
    canShowQr: reclamo.canShowQr,
  });
}
